interface Contact {
    id: string;
    name: string;
    email: string;
    company: string;
    status: "lead" | "prospect" | "customer";
    createdAt: Date;
}

export const sheet = new Map<string, Contact>();

sheet.set("1", {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Example Inc",
    status: "lead",
    createdAt: new Date("2021-01-01"),
});

sheet.set("2", {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    company: "Example Inc",
    status: "prospect",
    createdAt: new Date("2021-01-02"),
});

sheet.set("3", {
    id: "3",
    name: "Jim Beam",
    email: "jim.beam@example.com",
    company: "Example Inc",
    status: "customer",
    createdAt: new Date("2021-01-03"),
});

export function getContact(id: string): Contact | null {
    return sheet.get(id) || null;
}

export function createContact(
    contact: Omit<Contact, "id" | "createdAt">
): Contact {
    const newContact: Contact = {
        ...contact,
        id: String(sheet.size + 1),
        createdAt: new Date(),
    };
    sheet.set(newContact.id, newContact);
    return newContact;
}

export function updateContact(
    id: string,
    updates: Partial<Omit<Contact, "id" | "createdAt">>
): Contact | null {
    const contact = sheet.get(id);
    if (!contact) return null;

    const updatedContact = { ...contact, ...updates };
    sheet.set(id, updatedContact);
    return updatedContact;
}

export function deleteContact(id: string): boolean {
    return sheet.delete(id);
}