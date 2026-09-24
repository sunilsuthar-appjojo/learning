import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title aur content dono zaroori hain' }, { status: 400 });
    }

    const db = await getDbConnection();
    
    // Update the blog entry
    const result = await db.run(
      `UPDATE blogs SET title = ?, content = ? WHERE id = ?`,
      [title, content, id]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Log updated successfully' }, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const db = await getDbConnection();
    
    // Delete the blog entry
    const result = await db.run(`DELETE FROM blogs WHERE id = ?`, [id]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Log deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
