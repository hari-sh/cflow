ipfile = r""
opfile = r""

ip = open(ipfile)
op = open(opfile, 'w+')

for line in ip:
  line = line.rsplit('()')[0] + '()\n'
  op.write(line)

ip.close()
op.close()
