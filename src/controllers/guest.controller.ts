import { Request, Response } from "express";
import postModel from "../database/models/post.model";

const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await postModel.find({});

    if (!posts) return res.status(404).json({ error: "No posts found!" });

    const final = posts.map((post) => {
      const { _id, title, imageNames } = post.toObject();
      return { _id, title, image: imageNames[0] };
    });

    return res.status(200).json({ message: "Posts retrieved!", posts: final });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById({ _id: id });

    if (!post) return res.status(404).json({ error: "No post found!" });

    return res
      .status(200)
      .json({ message: "Post retrieved!", post: post.toObject() });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const controller = {
  getPosts,
  getPost,
};

export default controller;
