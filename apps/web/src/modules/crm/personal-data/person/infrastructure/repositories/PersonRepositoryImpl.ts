import { createApiClient } from "@kplian/infrastructure";
import { DEFAULT_PAGE_SIZE } from '@kplian/core';
import { PersonRepository } from "../../domain/repositories/PersonRepository";
import { CreatePersonDto, Person, UpdatePersonDto } from "../../domain/entities/Person";

// Module configuration
const apiClient = createApiClient('crm');
const BACKEND_ROUTES = {
    PERSON: '/v1/persons',
};

export class PersonRepositoryImpl implements PersonRepository {
  async getByCreator(username: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string; 
  }): Promise<Person[]> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filter = "" } = params || {};
    
    try {
      const response = await apiClient.get<any>(`${BACKEND_ROUTES.PERSON}/by-creator/${username}`, {
        params: {
          page,
          size: pageSize,
          filter,
        }
      });
      
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      return data.data || data.content || data.results || [];
    } catch (error) {
      console.error(`Error in PersonRepository.getByCreator(${username}):`, error);
      throw error;
    }
  }

  async getByVendorId(vendorId: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string; 
  }): Promise<Person[]> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filter = "" } = params || {};
    try {
      const response = await apiClient.get<any>(`${BACKEND_ROUTES.PERSON}/by-vendor-id/${vendorId}`, {
        params: {
          page,
          size: pageSize,
          filter,
        }
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data.data || data.content || data.results || [];
    } catch (error) {
      console.error(`Error in PersonRepository.getByVendorId(${vendorId}):`, error);
      throw error;
    }
  }


  async getById(id: string): Promise<Person> {
    try {
      const response = await apiClient.get<Person>(`${BACKEND_ROUTES.PERSON}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in PersonRepository.getById(${id}):`, error);
      throw error;
    }
  }

  async create(person: CreatePersonDto): Promise<Person> {
    try {
      const response = await apiClient.post<Person>(BACKEND_ROUTES.PERSON, person);
      return response.data;
    } catch (error) {
      console.error("Error in PersonRepository.create:", error);
      throw error;
    }
  }

  async update(person: UpdatePersonDto): Promise<Person> {
    const { id, ...data } = person;
    try {
      const response = await apiClient.put<Person>(`${BACKEND_ROUTES.PERSON}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in PersonRepository.update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BACKEND_ROUTES.PERSON}/${id}`);
    } catch (error) {
      console.error(`Error in PersonRepository.delete(${id}):`, error);
      throw error;
    }
  }
}
