'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Album, LogOut, Plus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { UUID } from 'crypto'

// Define interfaces for type safety
interface MediaItem {
  album: string
  file: string
  media_type: string
  description: string
  tags: string
  approval_status: string
}

interface AlbumType {
  id: string
  title: string
  description: string
  cover_image: string
  privacy_settings: string
  sharelink: UUID
}

export default function Dashboard() {
  const router = useRouter()
  const [albums, setAlbums] = useState<AlbumType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumType | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [mediaSearchTerm, setMediaSearchTerm] = useState('')
  const [mediaSearchFilter, setMediaSearchFilter] = useState('all')
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    cover_image: null as File | null,
    privacy_settings: 'public'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    fetchAlbums()
  }, [])

  const token = Cookies.get('authToken')

  const refreshToken = async () => {
    const refresh = Cookies.get('refreshToken');
    try {
      const response = await fetch('http://127.0.0.1:8000/user/refresh-token/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refresh }),
      });
    
      if (!response.ok) throw new Error('Failed to refresh token');
      
      const data = await response.json();
      Cookies.set('authToken', data.access);
      Cookies.set('refreshToken', data.refresh);
    } catch (error) {
      console.error('Error refreshing token:', error);
      router.push('/login');
    }
  };

  const fetchAlbums = async () => {

    try {
      const response = await fetch('http://127.0.0.1:8000/albums/', {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    
      if (!response.ok) throw new Error('Failed to fetch albums');
    
      const data = await response.json();
      setAlbums(data.results);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const fetchMediaItems = async (sharelink: UUID) => {
    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`http://127.0.0.1:8000/sharelink/${sharelink}/`, {
        method: 'GET',
        credentials: 'include', // Include credentials if you're using sessions
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        await refreshToken();
        return fetchMediaItems(sharelink);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMediaItems(data.data);
    } catch (error) {
      console.error('Error fetching media items:', error);
      // Optionally show an error message to the user
      setMediaItems([]);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddAlbum = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', newAlbum.title);
    formData.append('description', newAlbum.description);
    if (newAlbum.cover_image) {
      formData.append('cover_image', newAlbum.cover_image);
    }
    formData.append('privacy_settings', newAlbum.privacy_settings);

    try {
      const token = Cookies.get('authToken');
      const response = await fetch('http://127.0.0.1:8000/albums/create/', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to add album');
      
      await fetchAlbums();
      setShowAddForm(false);
      setNewAlbum({
        title: '',
        description: '',
        cover_image: null,
        privacy_settings: 'public'
      });
    } catch (error) {
      console.error('Error adding album:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewAlbum({ ...newAlbum, cover_image: file });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/user/logout/', {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to log out');
      Cookies.remove('authToken');
      Cookies.remove('refreshToken');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAlbumClick = (album: AlbumType) => {
    setSelectedAlbum(album);
    fetchMediaItems(album.sharelink);
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMediaItems = mediaItems.filter(item => {
    const searchLower = mediaSearchTerm.toLowerCase();
    switch (mediaSearchFilter) {
      case 'description':
        return item.description.toLowerCase().includes(searchLower);
      case 'tags':
        return item.tags.toLowerCase().includes(searchLower);
      case 'status':
        return item.approval_status.toLowerCase().includes(searchLower);
      case 'type':
        return item.media_type.toLowerCase().includes(searchLower);
      default:
        return (
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.toLowerCase().includes(searchLower) ||
          item.approval_status.toLowerCase().includes(searchLower) ||
          item.media_type.toLowerCase().includes(searchLower)
        );
    }
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Album Dashboard</h1>
          <nav>
            <Button 
              variant="ghost" 
              className="w-full justify-start mb-2"
              onClick={() => {
                setShowAddForm(false);
                setSelectedAlbum(null);
              }}
            >
              <Album className="mr-2 h-4 w-4" /> View Albums
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start mb-2"
              onClick={() => {
                setShowAddForm(true);
                setSelectedAlbum(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Album
            </Button>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleLogout}>Confirm Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {!selectedAlbum && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search albums..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full"
              />
            </div>
          </div>
        )}

        {showAddForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Add New Album</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAlbum} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Album Title"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Album Description"
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                  required
                />
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  required
                />
                <Select
                  value={newAlbum.privacy_settings}
                  onValueChange={(value) => setNewAlbum({ ...newAlbum, privacy_settings: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy settings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit">Add Album</Button>
              </form>
            </CardContent>
          </Card>
        ) : selectedAlbum ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedAlbum.title} - Media</h2>
              <Button variant="ghost" onClick={() => setSelectedAlbum(null)}>
                <X className="h-4 w-4 mr-2" /> Close
              </Button>
            </div>
            
            <div className="flex gap-4 mb-6">
              <Input
                type="text"
                placeholder="Search media..."
                value={mediaSearchTerm}
                onChange={(e) => setMediaSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={mediaSearchFilter}
                onValueChange={setMediaSearchFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="tags">Tags</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Media Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMediaItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    {item.media_type === 'image' ? (
                      <Image
                        src={item.file}
                        alt={item.description}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover mb-4 rounded-md"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4 rounded-md">
                        <span className="text-gray-500">Media Preview</span>
                      </div>
                    )}
                    <p className="font-medium mb-2">{item.description}</p>
                    <p className="text-sm text-gray-600 mb-1">Tags: {item.tags}</p>
                    <p className="text-sm text-gray-600">Status: {item.approval_status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <Card 
                key={album.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleAlbumClick(album)}
              >
                <CardHeader>
                  <CardTitle>{album.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={album.cover_image}
                    alt={album.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover mb-4 rounded-md"
                  />
                  <p className="text-sm text-gray-600 mb-2">{album.description}</p>
                  <p className="text-xs text-gray-500">Privacy: {album.privacy_settings}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}