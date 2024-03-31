import AWS from 'aws-sdk';

const s3Config = {
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_SECRET_KEY,
};

const s3Client = new AWS.S3(s3Config);

type DataType = {
  fileName: string;
  fileData: Buffer;
  productName: string;
  userId: string;
}

export const saveImage = async (data: DataType) => {
  const bufferData = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: `images/${data.userId}/${data.productName}/${data.fileName}`,
    Body: data.fileData,
  };

  return s3Client.putObject(bufferData, (err, data) => {
    if (err) throw err;
    
    console.log(data);
  });
};
