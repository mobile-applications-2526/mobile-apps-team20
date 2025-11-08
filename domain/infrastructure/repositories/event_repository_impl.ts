import { EventRepository } from "@/domain/repository/event_repository";
import {  } from "../datasources/event_datasource_impl";
import { EventDataSource } from "@/domain/datasources/event_datasource";

export class EventRepositoryImpl implements EventRepository {
    // Implementation of event repository methods
    // Use the data source to perform operations
    constructor(private dataSource: EventDataSource){}   
}
