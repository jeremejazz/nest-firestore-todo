import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { FirestoreModule } from 'src/firestore/firestore.module';

@Module({
  imports: [FirestoreModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
