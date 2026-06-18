<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Portfolio of John Doe - Software Developer & Graphic Designer specializing in web development, UI/UX design, and branding.">
    <meta name="keywords" content="software developer, graphic designer, web development, UI/UX, portfolio">
    <meta name="author" content="John Doe">
    <meta property="og:title" content="John Doe | Software Developer & Graphic Designer">
    <meta property="og:description" content="Professional portfolio showcasing web development, graphic design, and UI/UX projects.">
    <meta property="og:type" content="website">
    <title>John Doe | Software Developer & Graphic Designer</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- Loading Screen -->
    <div id="loader">
        <div class="loader-spinner"></div>
    </div>

    <!-- Navbar -->
    <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="container">
            <a href="#hero" class="nav-logo">JD.</a>

            <ul class="nav-links">
                <li><a href="#hero" class="active">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#portfolio">Portfolio</a></li>
                <li><a href="#resume">Resume</a></li>
                <li><a href="#contact">Contact</a></li>
                <li>
                    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
                        <i class="fas fa-moon"></i>
                    </button>
                </li>
            </ul>

            <button class="hamburger" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>
