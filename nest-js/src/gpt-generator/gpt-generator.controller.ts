import {
  Body,
  Controller,
  Post,
  Req,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GptGeneratorService } from './gpt-generator.service';
import { AuthGuard } from 'src/auth/auth.guard';
import createReport from 'docx-templates';
import * as fs from 'fs';
@Controller('gpt-generator')
export class GptGeneratorController {
  constructor(private readonly gptGeneratorService: GptGeneratorService) {}

  @UseGuards(AuthGuard)
  @Post('downloadRecord')
  async downloadRecord(@Body() body, @Req() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();

    const template = fs.readFileSync(
      `${process.env.RESOURCE_PATH}/templates/notes.docx`,
    );

    const buffer = await createReport({
      template,
      data: {
        notes: body.text,
      },
    });

    return new StreamableFile(buffer);
  }

  @UseGuards(AuthGuard)
  @Post('queryOptions')
  async queryOptions(@Body() body, @Req() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();

    const questionsPath = fs.readFileSync(
      `${process.env.RESOURCE_PATH}/templates/gptQuestions.json`,
    );
    const questionJSON = JSON.parse(questionsPath.toString());
    if (body.action) {
      if (body.action === 'appendPublic') {
        if (questionJSON.questions.includes(body.value)) return questionJSON;
        questionJSON.questions.push(body.value);
      } else if (body.action === 'append') {
        if (questionJSON.privateQuestions.includes(body.value))
          return questionJSON;
        questionJSON.privateQuestions.push(body.value);
      } else if (body.action === 'remove') {
        questionJSON.questions = questionJSON.questions.filter(
          (question) => question !== body.value,
        );
      }
      fs.writeFileSync(
        `${process.env.RESOURCE_PATH}/templates/gptQuestions.json`,
        JSON.stringify(questionJSON),
      );
    }
    return questionJSON;
  }
}
