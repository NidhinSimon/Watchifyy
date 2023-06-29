app.post('/admin/category', (req, res) => {
    const file = req.files.image; // Assuming you are using a file upload library like `express-fileupload`
    const { name } = req.body;
  
    // Save the uploaded file temporarily
    const filePath = path.join(__dirname, 'uploads', file.name);
    file.mv(filePath, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Error occurred during file upload.');
      }
  
      // Perform image processing with Cropper.js
      const image = fs.readFileSync(filePath);
      const cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        // Other options...
      });
  
      // Example: Crop the image
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImageBuffer = croppedCanvas.toBuffer();
  
      // Example: Save the cropped image to a new file
      const croppedFilePath = path.join(__dirname, 'uploads', 'cropped_' + file.name);
      fs.writeFileSync(croppedFilePath, croppedImageBuffer);
  
      // Remove the temporary uploaded file
      fs.unlinkSync(filePath);
  
      // Other code to process the cropped image, save to database, etc.
  
      // Send a response or redirect to another page
      res.send('Image cropped and saved successfully.');
    });
  });
  