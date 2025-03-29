import Banner from "../models/BannerModel.js";
import path from "path";
import fs from "fs";

export const getBanners = async (req, res) => {
  try {
    const response = await Banner.findAll();
    res.status(200).json({
      success: "true",
      message: "Data fetched successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      success: "false",
      message: "Data fetched failed",
      errors: error || "Invalid parameters",
    });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const response = await Banner.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if(!response) {
      return  res.status(404).json({ success: "false", message: "Banner not found!" });
    }
    return res.status(200).json({
      success: "true",
      message: "Data fetched successfully",
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      success: "false",
      message: "Data fetched failed",
      errors: error || "Invalid parameters",
    });
  }
};

export const createBanner = (req, res) => {
  if (req.files === null)
    return res.status(400).json({ msg: "No File Uploaded" });
  const { title, text_description, text_button, link_button, order, active } =
    req.body;

  const description = JSON.stringify({
    text: text_description,
    text_button: text_button,
    link_button: link_button,
  });

  const isActive = active === "true" ? true : false;
  if (order instanceof Number) {
    return res
      .status(400)
      .json({ success: "false", message: "Invalid order. Expected a number." });
  }
  const status = JSON.stringify({ order: order, active: isActive });

  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/banner/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLowerCase()))
    return res
      .status(422)
      .json({ success: "false", message: "Invalid Images" });
  if (fileSize > 10000000)
    return res
      .status(422)
      .json({ success: "false", message: "Image must be less than 10 MB" });

  file.mv(`./public/images/banner/${fileName}`, async (err) => {
    if (err)
      return res
        .status(500)
        .json({
          success: "false",
          message: "Something went wrong!",
          errors: err,
        });
    try {
      const response = await Banner.create({
        title: title,
        file_name: fileName,
        file: file.name,
        url: url,
        description: description,
        status: status,
      });
      res.status(201).json({
        success: "true",
        message: "Banner created successfully",
        data: response,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({success: "false", message: "Somethin went wrong!"})
    }
  });
};

export const updateBanner = async (req, res) => {
  const banner = await Banner.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!banner)
    return res
      .status(404)
      .json({ success: "false", message: "Banner not found!" });

  let fileName = "";
  let filePrev = "";
  if (req.files === null) {
    filePrev = banner.file;
    fileName = banner.file_name;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    filePrev = file.name
    fileName = file.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res
        .status(422)
        .json({ success: "false", message: "Invalid Images" });
    if (fileSize > 10000000) return res || "Invalid parameters";
    const filepath = `./public/images/banner/${banner.file_name}`;
    fs.unlinkSync(filepath);

    file.mv(`./public/images/banner/${fileName}`, (err) => {
      if (err)
        return res
          .status(500)
          .json({
            success: "false",
            message: "Something went wrong!",
            errors: err,
          });
    });
  }

  const { title, text_description, text_button, link_button, order, active } =
    req.body;

  const description = JSON.stringify({
    text: text_description,
    text_button: text_button,
    link_button: link_button,
  });

  const isActive = active === "true" ? true : false;
  if (order instanceof Number) {
    return res
      .status(400)
      .json({ success: "false", message: "Invalid order. Expected a number." });
  }
  const status = JSON.stringify({ order: order, active: isActive });

  const url = `${req.protocol}://${req.get("host")}/images/banner/${fileName}`;
  

  try {
    const response = await Banner.update(
      {
        title: title,
        file_name: fileName,
        file: filePrev,
        url: url,
        description: description,
        status: status,
      },
      {
        where: {
          uuid: req.params.id,
        },
      }
    );
    return res.status(201).json({
      success: "true",
      message: "Banner updated successfully",
      data: response,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({success: "false", message: "Something went wrong!", errors: error})
  }
};

export const deleteBanner = async (req, res) => {
  const banner = await Banner.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!banner) return res.status(404).json({ success: "false", message: "Banner not found!" });

  try {
    const filepath = `./public/images/banner/${banner.image}`;
    fs.unlinkSync(filepath);
    await Banner.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json({success: "true", message: "Banner Deleted Successfuly" });
  } catch (error) {
    console.log(error.message);
    return res.status(200).json({success: "false", message: "Something went wrong!" });
  }
};
