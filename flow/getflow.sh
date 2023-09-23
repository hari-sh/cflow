get_fwd_flow()
{
  files=$(find_files)
  echo $files > files
  (cflow --omit-arguments --brief --all $files) > fwdflow
}

find_files()
{
  find \( -path '' -or -path '' \) -and \( -name "*.c" -or -name "*.cpp" \)
}
get_fwd_flow()
