$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\images"

function New-Canvas($size, [switch]$Transparent) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    if ($Transparent) {
        $g.Clear([System.Drawing.Color]::Transparent)
    }
    return @{ Bitmap = $bmp; Graphics = $g }
}

function New-RoundedRectPath($x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-GradientBackground($g, $size) {
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(8, 46, 116)), ([System.Drawing.Color]::FromArgb(37, 99, 235)), 45
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    $glow1 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(34, 125, 211, 252))
    $glow2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
    $g.FillEllipse($glow1, [int]($size * 0.58), [int](-$size * 0.11), [int]($size * 0.52), [int]($size * 0.52))
    $g.FillEllipse($glow2, [int](-$size * 0.15), [int]($size * 0.62), [int]($size * 0.46), [int]($size * 0.46))
    $glow1.Dispose()
    $glow2.Dispose()
}

function Draw-YMark($g, $size, $x, $y, $scale, [switch]$Dark) {
    $white = if ($Dark) { [System.Drawing.Color]::FromArgb(8, 46, 116) } else { [System.Drawing.Color]::White }
    $accent = if ($Dark) { [System.Drawing.Color]::FromArgb(37, 99, 235) } else { [System.Drawing.Color]::FromArgb(124, 232, 255) }

    $toPoint = {
        param($px, $py)
        New-Object System.Drawing.PointF (($x + ($px * $scale))), (($y + ($py * $scale)))
    }

    $pen = New-Object System.Drawing.Pen $white, (88 * $scale)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $p1 = & $toPoint 210 145
    $p2 = & $toPoint 340 340
    $p3 = & $toPoint 470 145
    $p4 = & $toPoint 340 590

    $g.DrawLine($pen, $p1, $p2)
    $g.DrawLine($pen, $p3, $p2)
    $g.DrawLine($pen, $p2, $p4)

    $accentBrush = New-Object System.Drawing.SolidBrush $accent
    $dot = 42 * $scale
    $g.FillEllipse($accentBrush, $p2.X - ($dot / 2), $p2.Y - ($dot / 2), $dot, $dot)

    $accentBrush.Dispose()
    $pen.Dispose()
}

function Save-Png($bitmap, $path) {
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# App icon
$c = New-Canvas 1024
Draw-GradientBackground $c.Graphics 1024
Draw-YMark $c.Graphics 1024 172 170 1.0
Save-Png $c.Bitmap (Join-Path $out "yara-icon-final.png")
$c.Graphics.Dispose()
$c.Bitmap.Dispose()

# Adaptive icon foreground
$c = New-Canvas 1080 -Transparent
Draw-YMark $c.Graphics 1080 200 185 1.0
Save-Png $c.Bitmap (Join-Path $out "yara-adaptive-foreground-final.png")
$c.Graphics.Dispose()
$c.Bitmap.Dispose()

# Adaptive icon background
$c = New-Canvas 1080
Draw-GradientBackground $c.Graphics 1080
Save-Png $c.Bitmap (Join-Path $out "yara-adaptive-background-final.png")
$c.Graphics.Dispose()
$c.Bitmap.Dispose()

# Monochrome adaptive icon
$c = New-Canvas 1080 -Transparent
Draw-YMark $c.Graphics 1080 200 185 1.0 -Dark
Save-Png $c.Bitmap (Join-Path $out "yara-monochrome-final.png")
$c.Graphics.Dispose()
$c.Bitmap.Dispose()

# Splash logo
$c = New-Canvas 1024 -Transparent
Draw-YMark $c.Graphics 1024 192 130 0.94
$font = New-Object System.Drawing.Font "Segoe UI", 148, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$c.Graphics.DrawString("Yara", $font, $textBrush, (New-Object System.Drawing.RectangleF 0, 710, 1024, 190), $sf)
Save-Png $c.Bitmap (Join-Path $out "yara-splash-logo-final.png")
$sf.Dispose()
$textBrush.Dispose()
$font.Dispose()
$c.Graphics.Dispose()
$c.Bitmap.Dispose()

# Favicon
$c = New-Canvas 512
Draw-GradientBackground $c.Graphics 512
Draw-YMark $c.Graphics 512 86 85 0.5
Save-Png $c.Bitmap (Join-Path $out "yara-favicon-final.png")
$c.Graphics.Dispose()
$c.Bitmap.Dispose()

# Horizontal logo for store/listing material
$bmp = New-Object System.Drawing.Bitmap 1600, 520, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)
$cardPath = New-RoundedRectPath 36 64 392 392 92
$rect = New-Object System.Drawing.Rectangle 36, 64, 392, 392
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(8, 46, 116)), ([System.Drawing.Color]::FromArgb(37, 99, 235)), 45
$g.FillPath($brush, $cardPath)
Draw-YMark $g 520 12 34 0.52
$font = New-Object System.Drawing.Font "Segoe UI", 190, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(8, 46, 116))
$g.DrawString("Yara", $font, $textBrush, 500, 148)
Save-Png $bmp (Join-Path $out "yara-logo-horizontal-final.png")
$textBrush.Dispose()
$font.Dispose()
$brush.Dispose()
$cardPath.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Host "Yara brand assets generated in $out"
