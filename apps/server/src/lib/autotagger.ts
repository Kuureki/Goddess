import fetch from 'ky';

export interface AutoTaggerOptions {
  file: File;
  format: 'json';
}

export async function tag({ file, format }: AutoTaggerOptions) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  };

  const response = await fetch('https://autotagger.donmai.us/evaluate', options);

  if (response.ok) {
    const data = await response.json();
    console.log(data);
  } else {
    console.error('Failed to tag file:', response.statusText);
  }
}
