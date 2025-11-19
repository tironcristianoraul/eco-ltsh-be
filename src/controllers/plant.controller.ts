import { NextFunction, Request, Response } from "express";
import plantModel from "../database/models/plant.model";
import { Types } from "mongoose";
import * as fs from "fs/promises";

const uploadPlant = async (req: Request, res: Response) => {
  try {
    const { name, link } = req.body;

    const plant = new plantModel({
      _id: new Types.ObjectId(),
      name,
      link,
    });

    await plant
      .save()
      .then(() => {
        return res.status(201).json({
          message: "Successfully uploaded plant!",
        });
      })
      .catch((e) => {
        return res.status(500).json({
          error: `${e}`,
        });
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const deletePlant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await plantModel.findById({ _id: id });

    if (!plant) return res.status(404).json({ error: "Plant not found!" });

    await plant
      .deleteOne()
      .then(() => {
        return res.status(200).json({ message: "Successfully deleted plant!" });
      })
      .catch((e) => {
        return res.status(500).json({
          error: `Plant could not be deleted! Reason: ${e}`,
        });
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const updatePlant = async (req: Request, res: Response) => {
  try {
    const { name, link } = req.body;

    const { id } = req.params;
    const plant = await plantModel.findById({ _id: id });
    if (!plant) return res.status(404).json({ error: "Plant not found!" });

    plant.name = name ? name : plant.name;
    plant.link = link ? link : plant.link;

    await plant
      .save({ validateModifiedOnly: true })
      .then(() => {
        return res.status(200).json({
          message: "Successfully updated plant!",
        });
      })
      .catch((e) => {
        return res.status(500).json({
          error: `${e}`,
        });
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const controller = {
  uploadPlant,
  deletePlant,
  updatePlant,
};

export default controller;
