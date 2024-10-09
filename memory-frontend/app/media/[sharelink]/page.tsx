'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Search, Edit } from 'lucide-react';
import Cookies from 'js-cookie';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";



interface MediaItem {
  id: string;
  album: string;
  file: string;
  media_type: string;
  description: string;
  tags: string;
  approval_status: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

export default function MediaPage({ params }: { params: { sharelink: string } }) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>('image'); // default to image
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);


  const token = Cookies.get('authToken');
  const { sharelink } = params;

  useEffect(() => {
    if (!sharelink) {
      setError('No sharelink provided');
      return;
    }
    fetchMediaItems();
  }, [sharelink, searchQuery, mediaTypeFilter, statusFilter]);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(mediaTypeFilter !== 'all' && { media_type: mediaTypeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(
        `http://127.0.0.1:8000/sharelink/${sharelink}/?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch media items: ${response.statusText}`);
      }

      const data: ApiResponse<MediaItem[]> = await response.json();
      setMediaItems(data.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    try {
      if (!newMediaFile) {
        throw new Error('No file selected');
      }
  
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const formData = new FormData();
      formData.append('file', newMediaFile);
      formData.append('media_type', mediaType); // dynamically set the media type
      formData.append('description', description);
      formData.append('tags', tags);
      // formData.append('approval_status', 'pending');
  
      const response = await fetch(`http://127.0.0.1:8000/sharelink/${sharelink}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,  // Use FormData as the body
      });
  
      if (!response.ok) {
        const errorMessages = await response.json();
        // Assuming you want to show the first error message
        alert(errorMessages.message);  // Show the first error message in an alert
      }
  
      // Clear form after successful upload
      setNewMediaFile(null);
      setDescription('');
      setTags('');
      setMediaType('image'); // Reset the media type selection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  
      await fetchMediaItems(); // Refresh media items after successful upload
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add media');
      console.error('Error adding media:', error);
    }
  };

  const handleUpdateMedia = async (mediaId: string) => {
    try {
        if (!editingMedia) {
            throw new Error('No media item selected for update');
        }

        if (!token) {
            throw new Error('No authentication token found');
        }

        const formData = new FormData();
        // Include the new values in the formData
        formData.append('description', editingMedia.description);
        formData.append('tags', editingMedia.tags);
        formData.append('approval_status', editingMedia.approval_status); // Include approval status

        const response = await fetch(`http://127.0.0.1:8000/media/${sharelink}/${mediaId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorMessages = await response.json();
            alert(errorMessages.message);
        }

        await fetchMediaItems(); // Refresh media items after successful update
        setEditingMedia(null); // Clear the editing media state after update
    } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update media');
        console.error('Error updating media:');
      }
  };
  
  
  const handleRemoveMedia = async (mediaId: string) => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(`http://127.0.0.1:8000/media/${sharelink}/${mediaId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove media');
      }

      await fetchMediaItems();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove media');
      console.error('Error removing media:', error);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => setError(null)}>Dismiss Error</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Media Management</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Media Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mediaItems.map((item) => (
          <Card key={item.id} className="cursor-pointer">
            <CardContent className="p-4">
              <Image
                src={item.file}
                alt={item.description}
                width={300}
                height={200}
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <p className="font-medium mb-2">{item.description}</p>
              <p className="text-sm text-gray-600 mb-2">{item.tags}</p>
              <div className="flex justify-between items-center">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.approval_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : item.approval_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {item.approval_status}
              </span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleRemoveMedia(item.id)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Remove
                </Button>
                <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => {
                          setEditingMedia(item);
                          setDescription(item.description); // Set description for editing
                          setTags(item.tags); // Set tags for editing
                      }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Edit Media</DialogTitle>
                      </DialogHeader>
                      {editingMedia && (
                          <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="description" className="text-right">Description</Label>
                                  <Textarea
                                      id="description"
                                      value={editingMedia.description}
                                      onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                                      className="col-span-3"
                                  />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="tags" className="text-right">Tags</Label>
                                  <Input
                                      id="tags"
                                      value={editingMedia.tags} // Bind tags input to editingMedia
                                      onChange={(e) => setEditingMedia({ ...editingMedia, tags: e.target.value })}
                                      className="col-span-3"
                                  />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="status" className="text-right">Status</Label>
                                  <Select
                                      value={editingMedia.approval_status}
                                      onValueChange={(value) => setEditingMedia({
                                          ...editingMedia,
                                          approval_status: value as 'pending' | 'approved' | 'rejected'
                                      })}
                                  >
                                      <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => editingMedia && handleUpdateMedia(editingMedia.id)}
                              >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Update Media
                              </Button>
                          </div>
                      )}
                  </DialogContent>
              </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Media */}
      <div className="mb-6 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add New Media</h2>
        <div className="space-y-4">
          {/* Radio Buttons for Media Type */}
          <RadioGroup value={mediaType} onValueChange={(val) => setMediaType(val)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image" id="option-image" />
              <Label htmlFor="option-image">Image</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="video" id="option-video" />
              <Label htmlFor="option-video">Video</Label>
            </div>
          </RadioGroup>

          {/* File Upload Input */}
          <Input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setNewMediaFile(e.target.files?.[0] || null)}
          />
          
          {/* Description Input */}
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          {/* Tags Input */}
          <Input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          
          {/* Submit Button */}
          <Button onClick={handleAddMedia}>
            <Plus className="mr-2 h-4 w-4" /> Add Media
          </Button>
        </div>
      </div>

    </div>
  );
}
