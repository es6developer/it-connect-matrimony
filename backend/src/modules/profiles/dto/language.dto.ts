import { IsString, IsEnum, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LanguageItemDto {
  @IsString()
  language: string;

  @IsEnum(['native', 'fluent', 'intermediate', 'basic'])
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export class LanguagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LanguageItemDto)
  languages: LanguageItemDto[];
}
