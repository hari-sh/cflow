set -x

rootdir='/codes/ref/openocd'

find_files()
{
  gfind $rootdir -name '*.c' > fil
  #  -and \( -name *.c -or -name *.cpp \)
}

get_fwd_flow()
{
  files=$(gfind $rootdir -name '*.c')
  echo $files > files
  (cflow --omit-arguments --brief --all $files) > fwdflow
}

# get_fwd_flow()
get_fwd_flow