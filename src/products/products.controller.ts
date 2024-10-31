import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get('english')
  getEnglishProducts() {
    return this.productsService.getEnglishProducts();
  }

  @Get('recommend/menu/:id')
  getRecommendProducts(@Param('id') id: string) {
    return this.productsService.getRecommendProducts(+id);
  }

  @Get('recommend/menu/english/:id')
  getRecommendEnglishProducts(@Param('id') id: string) {
    return this.productsService.getRecommendEnglishProducts(+id);
  }

  @Get('recommend/recipe/:id')
  getRecommendRecipies(@Param('id') id: string) {
    return this.productsService.getRecommendRecepies(+id);
  }

  @Get('/recommend/recipe')
  getRecipies() {
    return this.productsService.getRecipies();
  }

  @Get('/detail/:id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProductDetail(+id);
  }

  @Post('/category')
  getProductsWithCategory(@Body('category') category: string) {
    return this.productsService.getProductsWithCategory(category);
  }

  @Post('recipe/category')
  getRecipesWithCategory(@Body('category') category: string) {
    return this.productsService.getRecipesWithCategory(category);
  }

  @Post('recipe')
  createRecipe(@Body('category') category: string) {
    return this.productsService.getProductsWithCategory(category);
  }

  @Get('recipe')
  getRecipes() {
    return this.productsService.getRecipies();
  }

  @Post('chatgpt')
  postGpt(@Param('content') content: string) {
    return this.productsService.getResFromGpt(content);
  }

  @Post()
  postProduct(
    @Body('companyName') companyName: string,
    @Body('isProduct') isProduct: boolean,
    @Body('menu') menu: string,
    @Body('price') price: number,
    @Body('explanation') explanation: string,
    @Body('allergy') allergy: string,
    @Body('isVegan') isVegan: boolean,
    @Body('isHalal') isHalal: boolean,
    @Body('category') category: string,
    @Body('isSpicy') isSpicy: boolean,
    @Body('isHot') isHot: boolean,
    @Body('link') link: string,
  ) {
    return this.productsService.createProduct({
      companyName,
      isProduct,
      menu,
      price,
      explanation,
      allergy,
      isVegan,
      isHalal,
      category,
      isSpicy,
      isHot,
      link,
    });
  }

  @Post('common')
  postCommonProduct(
    @Body('companyName') companyName: string,
    @Body('isProduct') isProduct: boolean,
    @Body('menu') menu: string,
    @Body('price') price: number,
    @Body('explanation') explanation: string,
    @Body('allergy') allergy: string,
    @Body('isVegan') isVegan: boolean,
    @Body('isHalal') isHalal: boolean,
    @Body('category') category: string,
    @Body('isSpicy') isSpicy: boolean,
    @Body('isHot') isHot: boolean,
    @Body('link') link: string,
  ) {
    return this.productsService.createCommonProduct({
      companyName,
      isProduct,
      menu,
      price,
      explanation,
      allergy,
      isVegan,
      isHalal,
      category,
      isSpicy,
      isHot,
      link,
    });
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(+id);
  }

  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImg(
    @UploadedFile() file: Express.Multer.File,
    @Body('id') id: string,
  ) {
    const product = await this.productsService.uploadImg(file, +id);

    return product;
  }
}
