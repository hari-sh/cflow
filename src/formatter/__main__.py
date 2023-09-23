ipfile = r"/codes/flowjs/src/flow/fwdflow"
opfile = r"/codes/flowjs/src/flow/fwd"

ip = open(ipfile)
op = open(opfile, 'w+')

for line in ip:
  line = line.rsplit('()')[0] + '()\n'
  op.write(line)

ip.close()
op.close()
