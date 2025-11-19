import { Request, Response } from "express";
import postModel from "../database/models/post.model";
import plantModel from "../database/models/plant.model";
import qrcode from "qrcode";

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

const getPlants = async (req: Request, res: Response) => {
  try {
    const plants = await plantModel.find({});

    if (!plants) return res.status(404).json({ error: "No plants found!" });

    return res.status(200).json({ message: "Plants retrieved!", plants });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const getPlant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await plantModel.findById({ _id: id });

    if (!plant) return res.status(404).json({ error: "No plant found!" });

    return res
      .status(200)
      .json({ message: "Plant retrieved!", plant: plant.toObject() });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const generateQR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plant = await plantModel.findOne({ _id: id });
    if (!plant) return res.status(404).json({ error: "Plant not found!" });
    const qr = await qrcode.toDataURL(plant.link);

    return res
      .status(200)
      .json({ qr, message: "QR Code created successfully!" });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const controller = {
  getPosts,
  getPost,

  getPlants,
  getPlant,

  generateQR,
};

export default controller;
