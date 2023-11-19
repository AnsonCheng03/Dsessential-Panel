import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class GptGeneratorService {
  questionBank(body, username) {
    const questionsPath = fs.readFileSync(
      `${process.env.RESOURCE_PATH}/templates/gptQuestions.json`,
    );
    const questionJSON = JSON.parse(questionsPath.toString());
    if (body.action) {
      if (body.action === 'appendPublic') {
        if (!username.startsWith('admin@')) {
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
        if (username.startsWith('admin@')) {
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
