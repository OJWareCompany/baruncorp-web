import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { InvoiceResponseDto, OrganizationResponseDto } from "@/api";
import { billingCodes } from "@/lib/constants";

interface Props {
  invoice: InvoiceResponseDto;
  organization: OrganizationResponseDto;
}

const styles = StyleSheet.create({
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#e2e8f0",
  },
  tableCol: {},
  tableCell: {
    padding: 4,
  },
});

export default function InvoiceDocument({ invoice, organization }: Props) {
  return (
    <Document>
      <Page
        size="A4"
        style={{
          paddingTop: 64,
          paddingHorizontal: 32,
          paddingBottom: 32,
          fontSize: 14,
          lineHeight: 1.5,
          color: "#020817",
        }}
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Helvetica-Bold",
              textAlign: "center",
            }}
          >
            INVOICE
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", marginBottom: 32 }}>
          <View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.bold}>Invoice Date: </Text>
              <Text>{format(new Date(invoice.invoiceDate), "MM-dd-yyyy")}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.bold}>Due Date: </Text>
              <Text>{format(new Date(invoice.dueDate), "MM-dd-yyyy")}</Text>
            </View>
          </View>
        </View>
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.bold}>Bill To:</Text>
          <Text>{organization.name}</Text>
          <Text>{organization.address.fullAddress}</Text>
          {organization.phoneNumber && <Text>{organization.phoneNumber}</Text>}
          {organization.email && <Text>{organization.email}</Text>}
        </View>
        <View style={{ marginBottom: 32 }}>
          <Text style={[styles.bold, { textAlign: "center", marginBottom: 8 }]}>
            Billing Code Legend
          </Text>
          <View
            style={{
              flexWrap: "wrap",
              flexDirection: "row",
              fontSize: 10,
            }}
          >
            {billingCodes.map((value) => (
              <View
                key={value.code}
                style={{ flexBasis: "33%", flexDirection: "row" }}
              >
                <Text style={[styles.bold, { flexBasis: 20 }]}>
                  {value.code}
                </Text>
                <Text>{value.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ fontSize: 10, marginBottom: 32 }}>
          <View
            style={[styles.tableRow, styles.bold, { borderColor: "#020817" }]}
          >
            <Text style={[styles.tableCell, { flexBasis: 20 }]}>#</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Description</Text>
            <Text style={[styles.tableCell, { flexBasis: 65 }]}>
              Property Type
            </Text>
            <Text style={[styles.tableCell, { flexBasis: 70 }]}>
              Billing Codes
            </Text>
            <Text style={[styles.tableCell, { flexBasis: 40 }]}>Price</Text>
            <Text style={[styles.tableCell, { flexBasis: 60 }]}>
              Date{"  "} Completed
            </Text>
          </View>
          {invoice.lineItems.map((value, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flexBasis: 20 }]}>{index}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {value.description}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 65 }]}>
                {value.propertyType}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 70 }]}>
                {value.billingCodes.map((value) => `(${value})`).join(" ")}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 40 }]}>
                ${value.price}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 60 }]}>
                {format(new Date(value.dateSentToClient), "MM-dd-yyyy")}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 32 }}>
          <View
            style={{
              flex: 2,
              border: `1px solid #e2e8f0`,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            <View
              style={{
                borderBottom: "1px solid #e2e8f0",
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={[styles.bold, { lineHeight: 1 }]}>Notes</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text>{invoice.notesToClient ?? "-"}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Subtotal</Text>
              <Text>${invoice.subtotal}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Discount</Text>
              <Text>${invoice.discount}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Total</Text>
              <Text>${invoice.total}</Text>
            </View>
          </View>
        </View>
        <View>
          <Text style={{ textAlign: "center", fontSize: 12 }}>
            Barun Corp | (610) 202-4506 | estherk@baruncorp.com |
            www.baruncorp.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}
