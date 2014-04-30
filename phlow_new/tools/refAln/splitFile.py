"""
  splitFile.py
  This program takes as input a fasta formatted sequence file and creates four five files
  The files are: i) Fragments ii) long iii) full length iv) reference iv) combination of ii,iii,iv
  Sequences with lengths less than a certain percentage of full length genome are fragments
  
"""

import sys,optparse,os,subprocess,shutil
from Bio import SeqIO

class splitFile:
  """
  """
  def __init__(self,opts=None):
    self.opts = opts

  def run(self):

    err = open(self.opts.log,'w')

    file_path = os.path.dirname(os.path.abspath(__file__)) 
    dir_path = file_path[:file_path.rfind("tools")]

    seqs = list(SeqIO.parse(self.opts.input,'fasta'))

    #print(len(seqs))
    
    max = 0

    for seq in seqs:
      if max < len(seq.seq):
        max = len(seq.seq)

    thr = int(max * (float(self.opts.per)/100))
    #print(thr)

    #print(len(refs))

    #SeqIO.write(refs,'reference.fasta','fasta')

    combs = []
    frags = []

    for seq in seqs:
      sLen = len(seq.seq)
      nLen = seq.seq.count('N')
      if sLen is not 0:
        nRat = float(nLen)/sLen
        if nRat < float(self.opts.nPer):
          if thr < len(seq.seq):
            combs.append(seq)
          else:
            frags.append(seq)

    #print(len(combs))
    #print(len(frags))

    SeqIO.write(combs,self.opts.full,'fasta')
    SeqIO.write(frags,self.opts.fragment,'fasta')



if __name__ == "__main__":
  op = optparse.OptionParser()
  op.add_option('-i','--input',default='sequences.fasta',help='Input sequence file')
  op.add_option('-f','--fragment',default='frag.fasta',help='Fragment sequences file')
#  op.add_option('-n','--long',default=None,help='Long sequences file')
  op.add_option('-u','--full',default='full.fasta',help='full sequences file')
#  op.add_option('-r','--reference',default=None,help='References sequences file')
  #op.add_option('-c','--combined',default='combined.fasta',help='combined sequences file')
  op.add_option('-l','--log',default='splitFile.log',help='Log file')
  op.add_option('-p','--per',default='50',help='Threshold for fragments')
  op.add_option('-n','--nPer',default='0.1',help='Percentage of Ns to remove sequence')

  opts, args = op.parse_args()
  assert opts.input <> None

  c = splitFile(opts)
  c.run() 

