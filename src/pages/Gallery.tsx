import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Image, Upload, X } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SEO from "@/components/SEO";

const Gallery = () => {
  const { user } = useAuth();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const { data: highlightedAlbums } = useQuery({
    queryKey: ["gallery-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*, photos:gallery_photos(id, image_url, caption)")
        .eq("is_highlighted", true)
        .eq("is_published", true);
      if (error) throw error;
      
      // Filter for approved photos only
      return data?.map(album => ({
        ...album,
        gallery_photos: (album.photos as any[])?.filter((p: any) => p.is_approved !== false) || []
      }));
    },
  });

  const { data: albums } = useQuery({
    queryKey: ["gallery-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*, gallery_photos(count)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: albumPhotos, refetch: refetchPhotos } = useQuery({
    queryKey: ["gallery-photos", selectedAlbum],
    queryFn: async () => {
      if (!selectedAlbum) return [];
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("album_id", selectedAlbum)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedAlbum,
  });

  const selectedAlbumData = albums?.find((a) => a.id === selectedAlbum);

  // Collect all highlight photos
  const highlightPhotos = highlightedAlbums?.flatMap(
    (album) => (album.gallery_photos as any[])?.map((p: any) => ({ ...p, albumTitle: album.title })) ?? []
  ) ?? [];

  return (
    <Layout>
      <SEO 
        title="Photo Gallery"
        description="View photos and highlights from UCOCSA fellowships, worship services, outreach activities, and community events."
      />
      <section className="py-16">
        <div className="container">
          <SectionHeading title="Photo Gallery" subtitle="Moments from our fellowship, worship, and outreach activities." />

          {/* Highlights Carousel */}
          {highlightPhotos.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-heading text-foreground mb-4">Highlights</h3>
              <Carousel opts={{ loop: true }} className="w-full max-w-4xl mx-auto">
                <CarouselContent>
                  {highlightPhotos.map((photo) => (
                    <CarouselItem key={photo.id}>
                      <div
                        className="relative aspect-video rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => setLightboxUrl(photo.image_url)}
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption || "Gallery highlight"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-sm text-white/90">{photo.caption || photo.albumTitle}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </Carousel>
            </div>
          )}

          {/* Album Grid or Album Detail */}
          {selectedAlbum ? (
            <div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="mb-6 text-sm text-primary hover:underline font-medium"
              >
                ← Back to Albums
              </button>
              <h3 className="text-2xl font-heading text-foreground mb-2">{selectedAlbumData?.title}</h3>
              {selectedAlbumData?.description && (
                <p className="text-muted-foreground mb-6">{selectedAlbumData.description}</p>
              )}

              {/* Upload button for logged-in users */}
              {user && <UploadPhotoDialog albumId={selectedAlbum} onSuccess={refetchPhotos} />}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {albumPhotos?.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setLightboxUrl(photo.image_url)}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Gallery photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
                {albumPhotos?.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-12">No approved photos yet in this album.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {albums?.map((album, i) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedAlbum(album.id)}
                >
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {album.cover_image_url ? (
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <Image size={40} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-foreground">{album.title}</h3>
                    {album.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{album.description}</p>
                    )}
                    <p className="text-xs text-primary mt-2">
                      {Array.isArray(album.gallery_photos) ? (album.gallery_photos[0] as any)?.count ?? 0 : 0} photos
                    </p>
                  </div>
                </motion.div>
              ))}
              {albums?.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">No albums yet. Check back soon!</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxUrl(null)}>
            <X size={28} />
          </button>
          <img src={lightboxUrl} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </Layout>
  );
};

function UploadPhotoDialog({ albumId, onSuccess }: { albumId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${albumId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);

      const { error: insertError } = await supabase.from("gallery_photos").insert({
        album_id: albumId,
        image_url: urlData.publicUrl,
        caption: caption || null,
        uploaded_by: user.id,
        is_approved: false,
      });
      if (insertError) throw insertError;

      toast.success("Photo uploaded! It will appear after admin approval.");
      setOpen(false);
      setFile(null);
      setCaption("");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mb-6 gap-2">
          <Upload size={16} /> Upload Photo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Textarea placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <p className="text-xs text-muted-foreground">Photos are reviewed by admins before appearing publicly.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Gallery;
