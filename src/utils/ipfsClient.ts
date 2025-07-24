import axios from 'axios';

const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET;
const auth = projectId && projectSecret ? 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64') : undefined;

export async function uploadToIPFS(content: string | Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', content);
  const res = await axios.post('https://ipfs.infura.io:5001/api/v0/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  return res.data.Hash || res.data.IpfsHash;
} 