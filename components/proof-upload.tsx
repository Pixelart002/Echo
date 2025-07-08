"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileImage, Loader2 } from "lucide-react"

interface ProofUploadProps {
  dealId: number
  onProofUploaded?: () => void
}

export function ProofUpload({ dealId, onProofUploaded }: ProofUploadProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const uploadProof = async () => {
    if (!user || !selectedFile) return

    setLoading(true)
    try {
      // Create a unique filename
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${dealId}_${user.id}_${Date.now()}.${fileExt}`

      // For demo purposes, we'll use a placeholder URL
      // In production, you would upload to Supabase Storage or another service
      const fileUrl = `/placeholder.svg?height=400&width=600&text=Payment+Proof+${dealId}`

      // Save proof record to database
      const { error } = await supabase.from("proofs").insert([
        {
          deal_id: dealId,
          user_id: user.id,
          file_url: fileUrl,
          caption: caption || null,
        },
      ])

      if (error) throw error

      toast({
        title: "Proof uploaded",
        description: "Your payment proof has been submitted successfully",
      })

      // Reset form
      setSelectedFile(null)
      setCaption("")
      onProofUploaded?.()
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload proof",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Upload Payment Proof
        </CardTitle>
        <CardDescription>Upload screenshot or photo of your payment confirmation</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proof-file">Select Image</Label>
          <Input id="proof-file" type="file" accept="image/*" onChange={handleFileSelect} className="cursor-pointer" />
          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption (Optional)</Label>
          <Textarea
            id="caption"
            placeholder="Add any additional details about the payment..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={uploadProof} disabled={!selectedFile || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Proof
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
