import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirestoreModule } from './firestore/firestore.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [ConfigModule.forRoot(), FirestoreModule, TodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
