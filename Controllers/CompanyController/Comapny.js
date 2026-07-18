const CompanyModel = require("../../Model/CompanyModel");


// const CompanyModel = require("../../Model/CompanyModel");

async function createCompany(req, res) {
    try {
        // Check if company already exists
        const existingCompany = await CompanyModel.findOne();

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company details already exist. Please update instead.",
            });
        }

        const imageUrl = req.file
            ? `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`
            : "";

        const company = await CompanyModel.create({
            companyName: req.body.companyName,
            companyDescription: req.body.companyDescription,
            email: req.body.email,
            phone: req.body.phone,
            founder: req.body.founder,
            licence: req.body.licence,
            certification: req.body.certification,
            companyImage: imageUrl,

            socialMedia: {
                instagram: req.body.instagram,
                facebook: req.body.facebook,
                linkedin: req.body.linkedin,
                twitter: req.body.twitter,
                youtube: req.body.youtube,
            },

            createdBy: req.user?._id,
        });

        res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: company,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}



async function updateCompany(req, res) {
    try {
  const { id } = req.params;

  const certification = req.body.certification
    ? JSON.parse(req.body.certification)
    : [];

  const socialMedia = req.body.socialMedia
    ? JSON.parse(req.body.socialMedia)
    : {};

  const customFields = req.body.customFields
    ? JSON.parse(req.body.customFields)
    : {};

  const updateData = {
    companyName: req.body.companyName,
    companyDescription: req.body.companyDescription,
    email: req.body.email,
    phone: req.body.phone,
    founder: req.body.founder,
    licence: req.body.licence,
    certification, 

    socialMedia,

    customFields,
  };

  if (req.file) {
    updateData.companyImage = `${req.protocol}://${req.get(
      "host"
    )}/upload/${req.file.filename}`;
  }

  const company = await CompanyModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Company updated successfully",
    data: company,
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: error.message,
  });

}
}


async function getCompany(req, res) {
    try {
        const company = await CompanyModel.findOne();

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company details not found",
            });
        }

        res.status(200).json({
            success: true,
            data: company,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

async function deleteCompany(req, res) {
    try {
        const { id } = req.params;

        const deleteData = await CompanyModel.findByIdAndDelete(id);

        if (!deleteData) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Company deleted successfully",
            data: deleteData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
module.exports = { deleteCompany, getCompany, updateCompany, createCompany }
