import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { FIRESTORE_PROVIDER } from '../firestore/firestore.module';
import { NotFoundException } from '@nestjs/common';


const mockTodo = { id: 'testId123', title: 'Test Todo', description: 'Test', isCompleted: false };
const mockTodoList = [mockTodo, { id: 'testId456', title: 'Another Todo', isCompleted: true }];

// Mock implementations for the methods of a Firestore DocumentReference
const docMock = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
    add: jest.fn(),
};

// Mock implementations for the methods of a Firestore CollectionReference
const collectionMock = {
  doc: jest.fn(() => docMock).mockReturnThis(),
  add: jest.fn(),
  get: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  docs: {
    map: jest.fn()
  }
};

// Mock the core Firestore methods:
const mockFirestoreProvider = {
  provide: FIRESTORE_PROVIDER,
  useValue: {
    collection: jest.fn(() => collectionMock),
  },
};


// (Paste Mock Setup from above here)

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(async () => {
    // 1. Setup the NestJS Testing Module
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService, mockFirestoreProvider],
    }).compile();

    service = module.get<TodoService>(TodoService);

    // 2. Reset all mock function calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ------------------------------------------------------------------
  // 🎯 CREATE Test
  // ------------------------------------------------------------------
  describe('create', () => {
    it('should successfully add a new todo to Firestore and return it', async () => {
      const createDto = { title: 'New Task', description: 'Details' };
      const newDocId = 'newlyGeneratedId';
      
      // Configure the mock 'collection' to return a DocumentReference with an ID
      jest.spyOn(collectionMock,'add').mockResolvedValue({id: newDocId})

      const result = await service.create(createDto as any);

      // Check if the Firestore methods were called correctly
      expect(mockFirestoreProvider.useValue.collection).toHaveBeenCalledWith('todos');
      expect(collectionMock.add).toHaveBeenCalledWith(expect.objectContaining({
          title: createDto.title,
          description: createDto.description,
          createdAt: expect.any(Object) // Check for FieldValue.serverTimestamp() equivalent
      }));
 
      
      // Check the returned structure
      expect(result).toEqual({ 
          id: newDocId, 
          ...createDto, 
          createdAt: expect.any(Date), // Check for the placeholder date
          updatedAt: expect.any(Date) 
      });
    });
  });

  // ------------------------------------------------------------------
  // 🎯 FIND ALL Test
  // ------------------------------------------------------------------
  describe('findAll', () => {
    it('should return an array of all todos', async () => {
      // Mock the get() call on the collection to return a snapshot
     jest.spyOn(collectionMock.docs, 'map').mockResolvedValue(mockTodoList)

      const result = await service.findAll();

      expect(mockFirestoreProvider.useValue.collection).toHaveBeenCalledWith('todos');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('testId123');
      expect(result[1].title).toBe('Another Todo');
    });
  });

  // ------------------------------------------------------------------
  // 🎯 FIND ONE Test
  // ------------------------------------------------------------------
  describe('findOne', () => {
    it('should return a todo if the ID exists', async () => {
      // Mock the doc().get() call to return an existing document


      jest.spyOn(collectionMock, 'get').mockResolvedValue({
        data: jest.fn().mockReturnValue(mockTodo),
        exists: true
      })

      const result = await service.findOne(mockTodo.id);

      expect(collectionMock.doc).toHaveBeenCalledWith(mockTodo.id);
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException if the todo ID does not exist', async () => {
      jest.spyOn(collectionMock, 'get').mockResolvedValue({
        exists: false
      })
      await expect(service.findOne('nonExistentId')).rejects.toThrow(NotFoundException);
    });
  });

  // ------------------------------------------------------------------
  // 🎯 UPDATE Test
  // ------------------------------------------------------------------
  describe('update', () => {
    it('should update the todo and return the updated object', async () => {
      const updateDto = { isCompleted: true };
      
      // Mock the update operation
      docMock.update.mockResolvedValue(true);
      
      // Mock the subsequent get operation to return the updated data
      docMock.get.mockResolvedValue({
        exists: true,
        id: mockTodo.id,
        data: jest.fn(() => ({ ...mockTodo, isCompleted: true })),
      });

      const result = await service.update(mockTodo.id, updateDto as any);

      expect(docMock.update).toHaveBeenCalledWith(expect.objectContaining({ 
        isCompleted: true,
        updatedAt: expect.any(Object) // Check for FieldValue.serverTimestamp() equivalent
      }));
      expect(result.isCompleted).toBe(true);
      expect(result.id).toBe(mockTodo.id);
    });
  });

  // ------------------------------------------------------------------
  // 🎯 REMOVE Test
  // ------------------------------------------------------------------
  describe('remove', () => {
    it('should successfully delete a todo and return a confirmation message', async () => {
      // 1. Mock the initial get check (must exist to delete)
      docMock.get.mockResolvedValue({ exists: true });
      // 2. Mock the delete operation
      docMock.delete.mockResolvedValue(true); 

      const result = await service.remove(mockTodo.id);

      expect(docMock.get).toHaveBeenCalled();
      expect(docMock.delete).toHaveBeenCalled();
      expect(result).toEqual({ id: mockTodo.id, message: `Todo with ID "${mockTodo.id}" successfully deleted` });
    });

    it('should throw NotFoundException if the todo ID does not exist before removal', async () => {
      // Mock the initial get check (must not exist)
      docMock.get.mockResolvedValue({ exists: false });

      await expect(service.remove('nonExistentId')).rejects.toThrow(NotFoundException);
    });
  });
});