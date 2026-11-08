Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\Hlaing Min Oo\Desktop\Code\InoviceFlow\public\oryx_receipt_reference.jpg"
$outDir = "c:\Users\Hlaing Min Oo\Desktop\Code\InoviceFlow\public"

$img = [System.Drawing.Bitmap]::FromFile($srcPath)

function Crop-Image($x, $y, $w, $h, $saveName) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $img.Clone($rect, $img.PixelFormat)
    $cropped.Save("$outDir\$saveName", [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "Saved $saveName ($w x $h)"
}

# Emblems & QR codes
Crop-Image 58 12 180 54 "oryx-logo.png"
Crop-Image 58 14 60 52 "oryx-emblem.png"
Crop-Image 692 304 52 52 "qr-facebook.png"
Crop-Image 785 304 52 52 "qr-tiktok.png"

# Watermark: The large central emblem watermark behind the table
# Center is ~432, table area is roughly y=35 to y=350, watermark is roughly x=240 to 620, y=30 to 350
Crop-Image 245 35 375 320 "oryx-watermark.png"

$img.Dispose()
Write-Host "Done extracting all assets including watermark!"
