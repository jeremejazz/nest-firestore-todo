import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FIRESTORE_PROVIDER } from 'src/firestore/firestore.module';
import { FieldValue, Firestore } from '@google-cloud/firestore';

@Injectable()
export class TodoService {
  private readonly collectionName = 'todos';

  constructor(
    @Inject(FIRESTORE_PROVIDER) private readonly firestore: Firestore,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    const todoPayload = {
      ...createTodoDto,
      createdAt: FieldValue.serverTimestamp(), 
      updatedAt: FieldValue.serverTimestamp(), 
    };
    const newDoc = await this.firestore
      .collection(this.collectionName)
      .add(todoPayload);
    return {
      id: newDoc.id,
      ...createTodoDto,

      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findAll() {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .orderBy('createdAt')
      .get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
  }

  async findOne(id: string) {
    const doc = await this.firestore
      .collection(this.collectionName)
      .doc(id)
      .get();
    if (!doc.exists) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    const docRef = this.firestore.collection(this.collectionName).doc(id);
    await docRef.update(updateTodoDto);

    // Fetch and return the updated document
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  async remove(id: string) {
    const docRef = this.firestore.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }

    await docRef.delete();
    return { id, message: `Todo with ID "${id}" successfully deleted` };
  }
}
