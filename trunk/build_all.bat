@ECHO off

REM   This simple batch file can be used to run Closure Compiler on
REM   WebGL Earth source files to produce single, optimized .js file.

set PROJECT_ROOT=C:/Users/Petr/Documents/WebGL-Earth/trunk
set LIB_ROOT=%PROJECT_ROOT%/closure-library/closure
set LEVEL=ADVANCED_OPTIMIZATIONS
set WEBGL_EXTERNS=--externs=webgl-externs.js
set DEFINE_FLAGS1=--define=goog.DEBUG=false
set DEFINE_FLAGS2=--define=we.CALC_FPS=true
set WARNING_FLAGS=--warning_level=VERBOSE

REM --define=goog.DEBUG=true 

@ECHO on

%LIB_ROOT%/bin/build/depswriter.py --root_with_prefix="%PROJECT_ROOT%/we/ ../../../we" --output_file="%PROJECT_ROOT%/we/deps.js_"

%LIB_ROOT%/bin/build/closurebuilder.py --root="%LIB_ROOT%/goog/" --root="%PROJECT_ROOT%/we/" --root="%PROJECT_ROOT%/closure-library/third_party/closure/" --namespace="we" --output_mode=compiled --compiler_jar="%PROJECT_ROOT%/compiler.jar" --compiler_flags="--compilation_level=%LEVEL%" --compiler_flags="%DEFINE_FLAGS1%" --compiler_flags="%DEFINE_FLAGS2%" --compiler_flags="%WARNING_FLAGS%" --compiler_flags="%WEBGL_EXTERNS%" --output_file="%PROJECT_ROOT%/compiled.js"

@ECHO off

REM --compiler_flags="--formatting=PRETTY_PRINT"

PAUSE