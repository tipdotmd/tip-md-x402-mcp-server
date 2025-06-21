import { Webhook as WebhookModel, WebhookEventType, WebhookEventFilter, WebhookEventTypeFilter } from "../client/api";
import { CreateWebhookOptions, UpdateWebhookOptions, PaginationOptions, PaginationResponse } from "./types";
/**
 * A representation of a Webhook,
 * which provides methods to create, list, update, and delete webhooks that are used to receive notifications of specific events.
 */
export declare class Webhook {
    private model;
    /**
     * Initializes a new Webhook object.
     *
     * @param model - The underlying Webhook object.
     * @throws {Error} If the model is not provided.
     */
    private constructor();
    /**
     * Returns a new Webhook object. Do not use this method directly. Instead, Webhook.create(...)
     *
     * @constructs Webhook
     * @param model - The underlying Webhook model object
     * @returns A Webhook object.
     */
    static init(model: WebhookModel): Webhook;
    /**
     * Creates a new webhook for a specified network.
     *
     * @param options - The options to create webhook.
     * @param options.networkId - The network ID for which the webhook is created.
     * @param options.notificationUri - The URI where notifications should be sent.
     * @param options.eventType - The type of event for the webhook.
     * @param options.eventTypeFilter - Filter for wallet or smart contract activity event types.
     * @param options.eventFilters - Filters applied to the events that determine which specific events trigger the webhook.
     * @returns A promise that resolves to a new instance of Webhook.
     */
    static create({ networkId, notificationUri, eventType, eventTypeFilter, eventFilters, }: CreateWebhookOptions): Promise<Webhook>;
    /**
     * Lists the Webhooks belonging to the CDP Project.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Webhooks to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Webhooks. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Webhooks.
     */
    static list({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<Webhook>>;
    /**
     * Returns the ID of the webhook.
     *
     * @returns The ID of the webhook, or undefined if the model is null.
     */
    getId(): string | undefined;
    /**
     * Returns the network ID associated with the webhook.
     *
     * @returns The network ID of the webhook, or undefined if the model is null.
     */
    getNetworkId(): string | undefined;
    /**
     * Returns the notification URI of the webhook.
     *
     * @returns The URI where notifications are sent, or undefined if the model is null.
     */
    getNotificationURI(): string | undefined;
    /**
     * Returns the event type of the webhook.
     *
     * @returns The type of event the webhook listens for, or undefined if the model is null.
     */
    getEventType(): WebhookEventType | undefined;
    /**
     * Returns the event type filter of the webhook.
     *
     * @returns The filter which will be used to filter for events of a certain event type
     */
    getEventTypeFilter(): WebhookEventTypeFilter | undefined;
    /**
     * Returns the event filters applied to the webhook.
     *
     * @returns An array of event filters used by the webhook, or undefined if the model is null.
     */
    getEventFilters(): Array<WebhookEventFilter> | undefined;
    /**
     * Returns the signature header of the webhook.
     *
     * @returns The signature header which will be set on the callback requests, or undefined if the model is null.
     */
    getSignatureHeader(): string | undefined;
    /**
     * Updates the webhook with a new notification URI, and optionally a new list of addresses to monitor.
     *
     * @param options - The options to update webhook.
     * @param options.notificationUri - The new URI for webhook notifications.
     * @param options.eventTypeFilter - The new eventTypeFilter that contains a new list (replacement) of addresses to monitor for the webhook.
     * @returns A promise that resolves to the updated Webhook object.
     */
    update({ notificationUri, eventTypeFilter, }: UpdateWebhookOptions): Promise<Webhook>;
    /**
     * Deletes the webhook.
     *
     * @returns A promise that resolves when the webhook is deleted and its attributes are set to null.
     */
    delete(): Promise<void>;
    /**
     * Returns a String representation of the Webhook.
     *
     * @returns A String representation of the Webhook.
     */
    toString(): string;
}
