Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile('c:\Users\Hlaing Min Oo\Desktop\Code\InoviceFlow\public\oryx_receipt_reference.jpg')

function Print-RGB($x, $y, $label) {
    $c = $img.GetPixel($x, $y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Host "$label at ($x, $y): RGB($($c.R), $($c.G), $($c.B)) -> $hex"
}

Print-RGB 20 30 "Left Header Block"
Print-RGB 750 30 "Receipt No Box"
Print-RGB 200 130 "Table Header Bar"
Print-RGB 200 360 "Footer Bottom Bar"
Print-RGB 100 95 "Student Name Label"

$img.Dispose()

