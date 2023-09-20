import { describe, expect, test, jest } from '@jest/globals';
import { prismaMock } from '../singleton'
import { PrismaClient, users as UsersType  } from '@prisma/client';
import initializePassport from './passport-config';
import {DoneFunc, Strategy as MagicStrategy, MagicUser } from 'passport-magic';
import { mockDeep, MockProxy, mockReset } from 'jest-mock-extended';
import { PassportStatic, use } from "passport"



const prisma = new PrismaClient({ log: ["query"] });

describe('initializePassport', () => {
  let passport: PassportStatic;

  beforeEach(() => {
    passport = {
      use: jest.fn(),
      serializeUser: jest.fn(),
      deserializeUser: jest.fn(),
    } as unknown as PassportStatic;
  });

  it('should initialize Passport with strategies and serialize/deserialize functions', () => {
    initializePassport(passport);

    // Verify that the use method is called with an instance of MagicStrategy
    expect(passport.use).toHaveBeenCalled();
    expect(passport.use).toHaveBeenCalledWith(
      expect.any(MagicStrategy)
    );

    // Verify that serializeUser and deserializeUser functions are set
    expect(passport.serializeUser).toHaveBeenCalled();
    expect(passport.deserializeUser).toHaveBeenCalled();
  });
  it('should login user and update last login time in the database', async () => {
    initializePassport(passport);

    

    const mockUser: MagicUser = {
      issuer: 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B',
      publicAddress: '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7',
      claim: {
        iat: 1234567890,
        ext: 1,
        iss: 'example_iss',
        sub: 'example_sub',
        aud: 'example_aud',
        nbf: 1,
        tid: 'example_tid',
        add: 'example_add',
      },
    };

    const mockExistingUser = {
      id : 1,                    
      issuer : "did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B",              
      name : "name",              
      description : "desc",   
      tag : 1,          
      walletAddress : "0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7",       
      walletType : "type",         
      coins : 100,                 
      role : 0,                  
      email : "test2@example.com",                
      whenSignedUp : new Date("2023-07-12 08:21:44.464"),       
      lastLoginAt : 1689173342,
      nftOwned: [24],      
      nftRented : [25],
      website : "website.com",       
      revenue : [],       
      listings : []  
};

    // Mock the PrismaClient methods
    /* const prismaMock = {
      users: {
        findUnique: jest.fn().mockResolvedValue(mockExistingUser),
        update: jest.fn().mockResolvedValue(mockExistingUser),
      },
    }; */
    prismaMock.users.findMany.mockResolvedValue([mockExistingUser]);
    prismaMock.users.update.mockResolvedValue(mockExistingUser);

    const originalPrismaClient = require('@prisma/client');
    jest.mock('@prisma/client', () => ({
      PrismaClient: jest.fn(() => prismaMock),
    }));

    const done: DoneFunc = jest.fn();

    const login = async (user: MagicUser, done: DoneFunc) => {
      const dbUser = await prismaMock.users.findUnique({
        where: {
          issuer: user.issuer,
        },
      }) as UsersType;
    await login(mockUser, done);

    expect(prismaMock.users.findUnique).toHaveBeenCalledWith({
      where: { issuer: mockUser.issuer },
    });

    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { issuer: mockUser.issuer },
      data: { lastLoginAt: mockUser.claim.iat },
    });

    expect(done).toHaveBeenCalledWith(null, mockUser);
  };
})
})

