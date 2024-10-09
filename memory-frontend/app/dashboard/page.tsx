'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { Album, LogOut, Search, Plus, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UUID } from 'crypto';

interface MediaItem {
  album: string;
  file: string;
  media_type: string;
  description: string;
  tags: string;
  approval_status: string;
}

interface AlbumType {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  privacy_settings: string;
  sharelink: UUID;
}

export default function Dashboard() {
  const router = useRouter();
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumType | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [mediaSearchFilter, setMediaSearchFilter] = useState('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const token = Cookies.get('authToken');

  const refreshToken = async () => {
    const refresh = Cookies.get('refreshToken');
    try {
      const response = await fetch('http://127.0.0.1:8000/user/refresh-token/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
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
      if (response.status === 401) {
        await refreshToken();
        // return fetchMediaItems(sharelink);
      }

      if (!response.ok) throw new Error('Failed to fetch albums');

      const data = await response.json();
      setAlbums(data.results);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
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

  const fetchMediaItems = async (sharelink: UUID) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/sharelink/${sharelink}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMediaItems(data.data);
    } catch (error) {
      console.error('Error fetching media items:', error);
      setMediaItems([]);
    }
  };

  const handleAlbumClick = (album: AlbumType) => {
    // setSelectedAlbum(album);
    // fetchMediaItems(album.sharelink);
    router.push(`/media/${album.sharelink}`)
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
        {!selectedAlbum ? (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map((album) => (
                <Card key={album.id} onClick={() => handleAlbumClick(album)} className="cursor-pointer">
                  <CardContent className="p-4">
                    <Image
                      src={album.cover_image}
                      alt={album.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover mb-4 rounded-md"
                    />
                    <p className="font-medium mb-2">{album.title}</p>
                    <p className="text-sm text-gray-600">{album.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <Button variant="ghost" onClick={() => setSelectedAlbum(null)}>
                <X className="mr-2 h-4 w-4" /> Close
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search media items..."
                  value={mediaSearchTerm}
                  onChange={(e) => setMediaSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMediaItems.map((item, index) => (
                <Card key={index} className="cursor-pointer">
                  <CardContent className="p-4">
                    <Image
                      src={item.file}
                      alt={item.description}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover mb-4 rounded-md"
                    />
                    <p className="font-medium mb-2">{item.description}</p>
                    <p className="text-sm text-gray-600">{item.tags}</p>
                    <p className="text-sm text-gray-600">{item.media_type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
