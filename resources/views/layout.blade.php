<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>LK Test</title>

    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="/css/app.css">
    <style>
      img { width: 100%; height: auto; }
      .editable:hover { border: 1px dashed #000; }
    </style>
  </head>
  
  <body>

  @yield('content')

  <script src="/js/app.js"></script>

  @yield('scripts')

    </body>
</html>