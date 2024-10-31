import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CompaniesModel } from './entities/companies.entity';
import { ProductsModel } from 'src/products/entities/products.entity';
import {
  AWS_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_SECRET_KEY,
} from '../products/consts/products.const';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';

@Injectable()
export class CompaniesService {
  private s3: S3Client;

  constructor(
    @InjectRepository(CompaniesModel)
    private readonly companyRepository: Repository<CompaniesModel>,
    @InjectRepository(ProductsModel)
    private readonly productRepository: Repository<ProductsModel>,
    private readonly dataSource: DataSource,
  ) {
    this.s3 = new S3Client({
      region: 'us-east-2',
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });
  }

  async resetCompanyIds() {
    await this.dataSource.query(
      `TRUNCATE TABLE companies_model RESTART IDENTITY`,
    );
  }

  async getCompanies() {
    return await this.companyRepository.find({
      relations: {
        products: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async getCompany(id: number) {
    return await this.companyRepository.findOne({
      where: {
        id,
      },
      relations: {
        products: true,
      },
    });
  }

  async getCompaniesWithCategory(category: string) {
    return await this.companyRepository.find({
      where: {
        category,
      },
    });
  }

  async createCompany(company: Omit<CompaniesModel, 'products' | 'image'>) {
    const products = await this.productRepository.find({
      where: {
        companyName: company.name,
      },
    });

    const newProduct = await this.companyRepository.create({
      ...company,
      products: products,
    });

    await this.companyRepository.save(newProduct);

    return newProduct;
  }

  async uploadImg(file: Express.Multer.File, id: number) {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ACL: 'public-read' as ObjectCannedACL,
    };

    const command = new PutObjectCommand(params);

    try {
      const data = await this.s3.send(command);
      const url = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;

      const company = await this.companyRepository.findOne({
        where: {
          id,
        },
      });

      company.image = url;

      const newCompany = await this.companyRepository.save(company);

      return newCompany;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteCompany(id: number) {
    try {
      return await this.companyRepository.delete(id);
    } catch {
      throw new BadRequestException(
        '참조하고 있는 Product가 존재하면 삭제 불가능합니다!',
      );
    }
  }
}
