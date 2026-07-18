const mongoose = require("mongoose");

//const DeveloperModel = require("../../Model/developerModel");
const DevelpoerModel = require("../../Model/DevepolerModel");

async function getDeveloperById(req, res) {
    try {
        const { id } = req.params;

        //const developer = await DevelpoerModel.findById(id);
        const developer = await DevelpoerModel.find();

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: "Developer not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: developer
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// async function getDeveloperBydetails(req, res) {
//     try {

//         //const developer = await DevelpoerModel.findById(id);
//         const developer = await DevelpoerModel.create(req.body);

//         if (!developer) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Developer not found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             data: developer
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }


// async function updateDeveloper(req, res) {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid Developer ID"
//             });
//         }

//         let updateData = {
//             ...req.body
//         };

//         if (req.file) {
//             updateData.image = req.file.path;
//         }

//         const developer = await DeveloperModel.findByIdAndUpdate(
//             id,
//             updateData,
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!developer) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Developer not found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Developer updated successfully",
//             data: developer
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }


module.exports = { getDeveloperById };