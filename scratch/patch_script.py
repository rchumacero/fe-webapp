import os

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)
        
base_dir = "/Users/admin/DevelopmentRCM/KPLIAN/BACKEND/ms-bucket/src/main/java/com/kplian/bucket/domain/service"

minio_path = os.path.join(base_dir, "MinioStorageService.java")
aws_path = os.path.join(base_dir, "AwsS3StorageService.java")
r2_path = os.path.join(base_dir, "CloudflareR2StorageService.java")

minio_old_head = """        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            } else {
                throw e;
            }
        }"""

minio_new_head = """        try {
            HeadBucketRequest headRequest = HeadBucketRequest.builder().bucket(bucket).build();
            s3Client.headBucket(headRequest);
        } catch (NoSuchBucketException e) {
            CreateBucketRequest createRequest = CreateBucketRequest.builder().bucket(bucket).build();
            s3Client.createBucket(createRequest);
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                CreateBucketRequest createRequest = CreateBucketRequest.builder().bucket(bucket).build();
                s3Client.createBucket(createRequest);
            } else {
                throw e;
            }
        }"""

put_old = "s3Client.putObject(builder.build(), RequestBody.fromInputStream(inputStream, contentLength));"
put_new = "PutObjectRequest putRequest = builder.build();\n        s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, contentLength));"


patch_file(minio_path, [(minio_old_head, minio_new_head), (put_old, put_new)])
patch_file(aws_path, [(put_old, put_new)])
patch_file(r2_path, [(put_old, put_new)])

print("Patching complete!")
