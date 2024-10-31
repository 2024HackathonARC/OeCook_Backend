import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsModel } from './entities/products.entity';
import { Repository } from 'typeorm';
import { CompaniesModel } from 'src/companies/entities/companies.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import {
  AWS_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_SECRET_KEY,
  OPEN_AI_API_KEY,
  OPEN_AI_ORGANIZATION,
} from './consts/products.const';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3'; // AWS SDK v3 S3 모듈 추가
import OpenAI from 'openai';
import { translate } from '@vitalets/google-translate-api';

@Injectable()
export class ProductsService {
  private s3: S3Client;
  private openAiApi: OpenAI;

  constructor(
    @InjectRepository(ProductsModel)
    private readonly productRepository: Repository<ProductsModel>,
    @InjectRepository(CompaniesModel)
    private readonly companyRepository: Repository<CompaniesModel>,
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
  ) {
    this.s3 = new S3Client({
      region: 'us-east-2',
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });

    this.openAiApi = new OpenAI({
      apiKey: OPEN_AI_API_KEY, // Directly using constant value
    });
  }

  async getProducts() {
    return await this.productRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getEnglishProducts() {
    const products = await this.productRepository.find({
      order: { id: 'ASC' },
    });

    const translatedProducts = await Promise.all(
      products.map(async (product) => {
        const translatedName = await this.getTranslatedText(
          product.companyName,
        );
        const translatedMenu = await this.getTranslatedText(product.menu);
        const translatedExplanation = await this.getTranslatedText(
          product.explanation,
        );
        const translatedAllergy = await this.getTranslatedText(product.allergy);
        const translatedCategory = await this.getTranslatedText(
          product.category,
        );

        return {
          ...product,
          companyName: translatedName,
          menu: translatedMenu,
          explanation: translatedExplanation,
          allergy: translatedAllergy,
          category: translatedCategory,
        };
      }),
    );

    return translatedProducts;
  }

  private async getTranslatedText(text: string): Promise<string> {
    const result = await translate(text, { from: 'ko', to: 'en' });
    return result.text;
  }

  async getProductDetail(id: number) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getRecipies() {
    return await this.productRepository.find({
      where: {
        isProduct: false,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async getProductsWithCategory(category: string) {
    return await this.productRepository.find({
      where: {
        category,
      },
    });
  }

  async getRecipesWithCategory(category: string) {
    return await this.productRepository.find({
      where: {
        category: category,
        isProduct: false,
      },
    });
  }

  async getResFromGpt(prompt: string) {
    const response = await this.openAiApi.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  }

  async getRecommendProducts(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userAllergies = user.allergy ? user.allergy.split(', ') : [];

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isProduct = true');

    if (user.isVegan) {
      products.andWhere('product.isVegan = :isVegan', {
        isVegan: user.isVegan,
      });
    }

    if (user.isHalal) {
      products.andWhere('product.isHalal = :isHalal', {
        isHalal: user.isHalal,
      });
    }

    if (userAllergies.length > 0) {
      userAllergies.forEach((allergy, index) => {
        products.andWhere(`product.allergy NOT LIKE :allergy${index}`, {
          [`allergy${index}`]: `%${allergy}%`,
        });
      });
    }

    return await products.getMany();
  }

  private async getTranslatedTextWithThrottle(
    text: string,
    delay = 1000,
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, delay)); // 일정 시간 대기
    const result = await translate(text, { from: 'ko', to: 'en' });
    return result.text;
  }

  async getRecommendEnglishProducts(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userAllergies = user.allergy ? user.allergy.split(', ') : [];

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isProduct = true');

    if (user.isVegan) {
      products.andWhere('product.isVegan = :isVegan', {
        isVegan: user.isVegan,
      });
    }

    if (user.isHalal) {
      products.andWhere('product.isHalal = :isHalal', {
        isHalal: user.isHalal,
      });
    }

    if (userAllergies.length > 0) {
      userAllergies.forEach((allergy, index) => {
        products.andWhere(`product.allergy NOT LIKE :allergy${index}`, {
          [`allergy${index}`]: `%${allergy}%`,
        });
      });
    }

    const recommendedProducts = await products.getMany();

    const translatedProducts = [];
    for (const product of recommendedProducts) {
      const translatedName = await this.getTranslatedTextWithThrottle(
        product.companyName,
      );
      const translatedMenu = await this.getTranslatedTextWithThrottle(
        product.menu,
      );
      const translatedExplanation = await this.getTranslatedTextWithThrottle(
        product.explanation,
      );
      const translatedAllergy = await this.getTranslatedTextWithThrottle(
        product.allergy,
      );
      const translatedCategory = await this.getTranslatedTextWithThrottle(
        product.category,
      );

      translatedProducts.push({
        ...product,
        companyName: translatedName,
        menu: translatedMenu,
        explanation: translatedExplanation,
        allergy: translatedAllergy,
        category: translatedCategory,
      });
    }

    return translatedProducts;
  }

  async getRecommendRecepies(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userAllergies = user.allergy ? user.allergy.split(', ') : [];
    const isVegan = user.isVegan;
    const isHalal = user.isHalal;

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isProduct = false')
      .andWhere('product.isVegan = :isVegan', { isVegan })
      .andWhere('product.isHalal = :isHalal', { isHalal });

    if (userAllergies.length > 0) {
      userAllergies.forEach((allergy, index) => {
        products.andWhere(`product.allergy NOT LIKE :allergy${index}`, {
          [`allergy${index}`]: `%${allergy}%`,
        });
      });
    }

    return await products.getMany();
  }

  async createProduct(
    product: Omit<ProductsModel, 'id' | 'image' | 'company'>,
  ) {
    const newProduct = await this.productRepository.create(product);

    await this.productRepository.save(newProduct);

    const company = await this.companyRepository.findOne({
      where: { name: product.companyName },
      relations: {
        products: true,
      },
    });

    company.products.push(newProduct);
    await this.companyRepository.save(company);

    return { productId: newProduct.id };
  }

  async createCommonProduct(
    product: Omit<ProductsModel, 'id' | 'image' | 'company'>,
  ) {
    const newProduct = await this.productRepository.create(product);

    await this.productRepository.save(newProduct);

    return newProduct;
  }

  async deleteProduct(id: number) {
    return await this.productRepository.delete(id);
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

      const product = await this.productRepository.findOne({
        where: {
          id,
        },
      });

      product.image = url;

      const newProduct = await this.productRepository.save(product);

      return newProduct;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}
