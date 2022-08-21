import { promisify } from 'util';
import cp from 'child_process';
const exec = promisify(cp.exec);

const path = process.argv[2];
const cmdOutput = (await exec(`cksum ${path}*.wav`)).stdout.trim();
const buckets = cmdOutput
.toString()
.split`\n`
.map(line => {
    const items = line.split` `;
    return { checksum: items[0], bytes: items[1], name: items[2] };
})
.sort((a,b) => a.checksum - b.checksum)
.reduce((t,v,i,a) => {
    t[v.checksum] = t[v.checksum] || [];
    t[v.checksum].push(v);
    return t;
}, {});

const duplicates = Object.entries(buckets).filter(e => e[1].length > 1);
console.log(duplicates.length);
