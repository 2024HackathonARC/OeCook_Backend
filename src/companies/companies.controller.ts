import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  getComapnies() {
    return this.companiesService.getCompanies();
  }

  @Get('/detail/:id')
  getCompany(
    @Param('id') id: string,
  ) {
    return this.companiesService.getCompany(+id);
  }

  @Post('/category')
  getCompaniesWithCategory(
    @Body('category') category: string,
  ) {
    return this.companiesService.getCompaniesWithCategory(category);
  }

  @Post()
  postCompany(
    @Body('id') id: string,
    @Body('name') name: string,
    @Body('category') category: string,
    @Body('explanation') explanation: string,
  ) {
    const numID = +id;
    return this.companiesService.createCompany({
      name,
      category,
      explanation,
      id: numID,
    });
  }

  @Delete(':id')
  deleteCompany(@Param('id') id: string) {
    return this.companiesService.deleteCompany(+id);
  }

  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImg(
    @UploadedFile() file: Express.Multer.File,
    @Body('id') id: string,
  ) {
    const product = await this.companiesService.uploadImg(file, +id);

    return product;
  }
}
