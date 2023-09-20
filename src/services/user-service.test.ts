import { describe, expect, test, jest } from '@jest/globals';
import { prismaMock } from '../singleton'
import { checkEmailUniqueness,checkNameUniqueness,checkWalletUniqueness,checkIssuerUniqueness,userByWalletAddress,isUserInDb,disconnectListingRelationFromUser } from './user-services';
import { PrismaClient, users } from '@prisma/client'

const prisma = new PrismaClient({ log: ["query"] });

describe('checkEmailUniqueness', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should return true when no user with the given email exists', async () => {
    
    const email = 'test@example.com';
    const mockUsersFindMany = prismaMock.users.findMany;
    mockUsersFindMany.mockResolvedValue([]);

    
    const result = await checkEmailUniqueness(email);

    
    expect(result).toBe(true);
  });

  test('should return false when user with the given email exists', async () => {
    const email = 'test2@example.com';
    const mockUser = {
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
    
    prismaMock.users.findMany.mockResolvedValue([mockUser]);
  
    const result = await checkEmailUniqueness(email);
  
  
    expect(result).toBe(false);
  });
  test('should throw error when database query fails', async () => {
    const email = 'test@example.com';
    const mockUsersFindMany = prismaMock.users.findMany;
    mockUsersFindMany.mockRejectedValue(new Error('Database error'));
  
    await expect(checkEmailUniqueness(email)).rejects.toThrow('Unable to check email');
  });
  });
  describe('checkNameUniqueness', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should return true when no user with the given name exists', async () => {
      const name = 'User Name';
      const mockUsersFindMany = prismaMock.users.findMany;
      mockUsersFindMany.mockResolvedValue([]);
  
      const result = await checkNameUniqueness(name);
  
      expect(result).toBe(true);
    });
  
    test('should return false when user with the given name exists', async () => {
      const name = 'User Name';
      const mockUser = {
        id: 1,
        issuer: "did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B",
        name: "User Name",
        description: "desc",
        tag: 1,
        walletAddress: "0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7",
        walletType: "type",
        coins: 100,
        role: 0,
        email: "test@example.com",
        whenSignedUp: new Date("2023-07-12 08:21:44.464"),
        lastLoginAt: 1689173342,
        nftOwned: [24],
        nftRented: [25],
        website: "website.com",
        revenue: [],
        listings: []
      };
  
      prismaMock.users.findMany.mockResolvedValue([mockUser]);
  
      const result = await checkNameUniqueness(name);
  
      expect(result).toBe(false);
    });
  
    test('should throw error when database query fails', async () => {
      const name = 'User Name';
      const mockUsersFindMany = prismaMock.users.findMany;
      mockUsersFindMany.mockRejectedValue(new Error('Database error'));
  
      await expect(checkNameUniqueness(name)).rejects.toThrow('Unable to check name');
    });
  });

  describe('checkWalletUniqueness', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should return true when no user with the given wallet address exists', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const mockUsersFindMany = prismaMock.users.findMany;
      mockUsersFindMany.mockResolvedValue([]);
  
      const result = await checkWalletUniqueness(walletAddress);
  
      expect(result).toBe(true);
    });
  
    test('should return false when user with the given wallet address exists', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const mockUser = {
        id: 1,
        issuer: "did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B",
        name: "User Name",
        description: "desc",
        tag: 1,
        walletAddress: "0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7",
        walletType: "type",
        coins: 100,
        role: 0,
        email: "test@example.com",
        whenSignedUp: new Date("2023-07-12 08:21:44.464"),
        lastLoginAt: 1689173342,
        nftOwned: [24],
        nftRented: [25],
        website: "website.com",
        revenue: [],
        listings: []
      };
  
      prismaMock.users.findMany.mockResolvedValue([mockUser]);
  
      const result = await checkWalletUniqueness(walletAddress);
  
      expect(result).toBe(false);
    });
  
    test('should throw error when database query fails', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const mockUsersFindMany = prismaMock.users.findMany;
      mockUsersFindMany.mockRejectedValue(new Error('Database error'));
  
      await expect(checkWalletUniqueness(walletAddress)).rejects.toThrow('Unable to check wallet address');
    });
  });

  describe('checkIssuerUniqueness', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should return true when no user with the given issuer exists', async () => {
      const issuer = 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B';
      const mockUsersFindMany = prismaMock.users.findMany;
      mockUsersFindMany.mockResolvedValue([]);
  
      const result = await checkIssuerUniqueness(issuer);
  
      expect(result).toBe(true);
    });
  
    test('should return false when user with the given issuer exists', async () => {
      const issuer = 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B';
      const mockUser = {
        id: 1,
        issuer: 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B',
        name: 'User Name',
        description: 'desc',
        tag: 1,
        walletAddress: '0x123456789abcdef',
        walletType: 'type',
        coins: 100,
        role: 0,
        email: 'test@example.com',
        whenSignedUp: new Date('2023-07-12 08:21:44.464'),
        lastLoginAt: 1689173342,
        nftOwned: [24],
        nftRented: [25],
        website: 'website.com',
        revenue: [],
        listings: []
      };
  
      prismaMock.users.findMany.mockResolvedValue([mockUser]);
  
      const result = await checkIssuerUniqueness(issuer);
  
      expect(result).toBe(false);
    });
  
    test('should throw error when database query fails', async () => {
      const issuer = 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B';
      const mockUsersFindMany = prismaMock.users.findMany;
      mockUsersFindMany.mockRejectedValue(new Error('Database error'));
  
      await expect(checkIssuerUniqueness(issuer)).rejects.toThrow('Unable to check issuer');
    });
  });

  describe('userByWalletAddress', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should return user when user with the given wallet address exists', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const mockUser = {
        id: 1,
        issuer: 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B',
        name: 'User Name',
        description: 'desc',
        tag: 1,
        walletAddress: '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7',
        walletType: 'type',
        coins: 100,
        role: 0,
        email: 'test@example.com',
        whenSignedUp: new Date('2023-07-12 08:21:44.464'),
        lastLoginAt: 1689173342,
        nftOwned: [24],
        nftRented: [25],
        website: 'website.com',
        revenue: [],
        listings: []
      };
  
      prismaMock.users.findUnique.mockResolvedValue(mockUser);
  
      const result = await userByWalletAddress(walletAddress);
  
      expect(result).toEqual(mockUser);
    });
  
    test('should return null when no user with the given wallet address exists', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      prismaMock.users.findUnique.mockResolvedValue(null);
  
      const result = await userByWalletAddress(walletAddress);
  
      expect(result).toBeNull();
    });
  
    test('should throw error when database query fails', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      prismaMock.users.findUnique.mockRejectedValue(new Error('Database error'));
  
      const result = await userByWalletAddress(walletAddress);
  
      expect(result).toBeNull();
    });
  });

  describe('isUserInDb', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should return user when a user with the given wallet address, issuer, and email exists', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const issuer = 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B';
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        issuer: 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B',
        name: 'User Name',
        description: 'desc',
        tag: 1,
        walletAddress: 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B',
        walletType: 'type',
        coins: 100,
        role: 0,
        email: 'test@example.com',
        whenSignedUp: new Date('2023-07-12 08:21:44.464'),
        lastLoginAt: 1689173342,
        nftOwned: [24],
        nftRented: [25],
        website: 'website.com',
        revenue: [],
        listings: []
      };
  
      prismaMock.users.findFirst.mockResolvedValue(mockUser);
  
      const result = await isUserInDb(walletAddress, issuer, email);
  
      expect(result).toEqual(mockUser);
    });
  
    test('should return null when no user with the given wallet address, issuer, and email exists', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const issuer = 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B';
      const email = 'test2@example.com';
      prismaMock.users.findFirst.mockResolvedValue(null);
  
      const result = await isUserInDb(walletAddress, issuer, email);
  
      expect(result).toBeNull();
    });
  
    test('should return null when an error occurs during database query', async () => {
      const walletAddress = '0x022e6fea6beDb83fA532cC7de254EBEA7d7694F7';
      const issuer = 'did:ethr:0x8451CCA44Ad1C7ef97a788060Ab48840B404389B';
      const email = 'test@example.com';
      prismaMock.users.findFirst.mockRejectedValue(new Error('Database error'));
  
      const result = await isUserInDb(walletAddress, issuer, email);
  
      expect(result).toBeNull();
    });
  });
  describe('disconnectListingRelationFromUser', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should disconnect listing relation from user by setting the listings array to empty array', async () => {
      const userName = 'User Name';
  
      const updateMock = jest.fn();
  
      prismaMock.users.update.mockImplementationOnce(updateMock as any);
  
      await disconnectListingRelationFromUser(userName);
  
      expect(updateMock).toHaveBeenCalledWith({
        where: {
          name: userName
        },
        data: {
          listings: {
            set: []
          }
        }
      });
    });
  });