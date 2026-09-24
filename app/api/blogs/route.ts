import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

// Naya blog banane ke liye POST request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    // Basic validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title aur content dono zaroori hain' },
        { status: 400 }
      );
    }

    // Ek simple slug banate hain title se (e.g., "My First Blog" -> "my-first-blog")
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const db = await getDbConnection();

    // Database me insert karna (is_published ko 1 yani Published rakhte hain test ke liye)
    const result = await db.run(
      `INSERT INTO blogs (title, slug, content, is_published) VALUES (?, ?, ?, ?)`,
      [title, slug, content, 1]
    );

    return NextResponse.json({
      message: 'Blog successfully create ho gaya!',
      blogId: result.lastID,
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST Error:", error);
    // Agar slug pehle se exist karta hai to error dega kyunki wo UNIQUE hai
    if (error.code === 'SQLITE_CONSTRAINT') {
      return NextResponse.json({ error: 'Is title/slug ka blog pehle se hai' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Saare blogs dekhne ke liye GET request
export async function GET() {
  try {
    const db = await getDbConnection();
    
    // Sirf published blogs ko nikalna
    const blogs = await db.all(`SELECT * FROM blogs WHERE is_published = 1 ORDER BY id DESC`);
    
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
