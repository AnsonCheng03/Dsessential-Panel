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
    const username = req.user.username;
    if (body.action) {
      if (body.action === 'appendPublic') {
        if (!req.user.username.startsWith('admin@')) {
          if (questionJSON[username])
            return {
              questions: questionJSON.questions,
              privateQuestions: questionJSON[username],
            };
          return {
            questions: questionJSON.questions,
            privateQuestions: [],
          };
        }
        if (questionJSON.questions.includes(body.value)) {
          if (questionJSON[username])
            return {
              questions: questionJSON.questions,
              privateQuestions: questionJSON[username],
            };
          return {
            questions: questionJSON.questions,
            privateQuestions: [],
          };
        }
        questionJSON.questions.push(body.value);
      } else if (body.action === 'append') {
        // if username not exist, create new array
        // append private question according to username
        if (!questionJSON[username]) questionJSON[username] = [];
        if (questionJSON[username].includes(body.value)) {
          if (questionJSON[username])
            return {
              questions: questionJSON.questions,
              privateQuestions: questionJSON[username],
            };
          return {
            questions: questionJSON.questions,
            privateQuestions: [],
          };
        }
        questionJSON[username].push(body.value);
      } else if (body.action === 'removePublic') {
        // only allow admin to remove public questions
        if (req.user.username.startsWith('admin@')) {
          if (questionJSON.questions.includes(body.value)) {
            questionJSON.questions = questionJSON.questions.filter(
              (item) => item !== body.value,
            );
          }
        }
      } else if (body.action === 'remove') {
        if (questionJSON[username].includes(body.value)) {
          questionJSON[username] = questionJSON[username].filter(
            (item) => item !== body.value,
          );
        }
      }
      fs.writeFileSync(
        `${process.env.RESOURCE_PATH}/templates/gptQuestions.json`,
        JSON.stringify(questionJSON),
      );
    }
    // only return public questions and the user's private questions
    if (questionJSON[username])
      return {
        questions: questionJSON.questions,
        privateQuestions: questionJSON[username],
      };
    return {
      questions: questionJSON.questions,
      privateQuestions: [],
    };
  }
}
