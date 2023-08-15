import {
  Body,
  Controller,
  Post,
  StreamableFile,
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
  async downloadRecord(@Body() body) {
    const template = fs.readFileSync(
      `${process.env.RESOURCE_PATH}/templates/notes.docx`,
    );

    const buffer = await createReport({
      template,
      data: {
        notes: body.text,
      },
    });

    console.log(buffer);

    return new StreamableFile(buffer);
  }

  @UseGuards(AuthGuard)
  @Post('queryOptions')
  async queryOptions(@Body() body) {
    const questionsPath = fs.readFileSync(
      `${process.env.RESOURCE_PATH}/templates/gptQuestions.json`,
    );
    const questionJSON = JSON.parse(questionsPath.toString());
    if (body.action) {
      if (body.action === 'append') {
        if (questionJSON.questions.includes(body.value)) return questionJSON;
        questionJSON.questions.push(body.value);
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
