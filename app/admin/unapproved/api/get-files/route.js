import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dur1dba1a",
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = 'student_docs/' + searchParams.get('folder');
    console.log("Cloudinary Config:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET);
    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    // List all resources in the specified folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 500,
    });

    // Transform the response to include only necessary information
    const files = result.resources.map((resource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      created_at: resource.created_at,
      bytes: resource.bytes,
      original_filename: resource.original_filename,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
