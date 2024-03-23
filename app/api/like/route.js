import { connectToMongodb } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/app/models/model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Post from "@/app/models/postModel";

export async function POST(req) {
  const { postId } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({
      message: "you have to login first!",
      ok: false,
    });
  }
  const { user: authUser } = session;
  const userId = authUser._id;

  try {
    connectToMongodb();
    const post = await Post.findById(postId);
    const likes = post["like"];
    if (likes.includes(userId)) {
      return NextResponse.json({
        message: "already liked this post!",
        ok: false,
      });
    }
    post.like.push(userId);
    await post.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error.message, ok: false });
  }
}
