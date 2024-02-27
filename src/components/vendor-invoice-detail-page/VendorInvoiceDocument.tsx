import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import {
  OrganizationResponseDto,
  VendorInvoiceLineItemResponse,
  VendorInvoiceResponseDto,
} from "@/api/api-spec";

Font.registerHyphenationCallback((word) => [word]);

interface Props {
  vendorInvoice: VendorInvoiceResponseDto;
  lineItems: VendorInvoiceLineItemResponse[];
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

export default function VendorInvoiceDocument({
  vendorInvoice,
  lineItems,
  organization,
}: Props) {
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
            VENDOR INVOICE
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", marginBottom: 32 }}>
          <View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.bold}>Invoice Date: </Text>
              <Text>
                {format(new Date(vendorInvoice.invoiceDate), "MM-dd-yyyy")}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.bold}>Due Date: </Text>
              <Text>
                {vendorInvoice.dueDate
                  ? format(new Date(vendorInvoice.dueDate), "MM-dd-yyyy")
                  : "-"}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.bold}>Bill To:</Text>
          <Text>{organization.name}</Text>
          <Text>{organization.address.fullAddress}</Text>
          {organization.phoneNumber && <Text>{organization.phoneNumber}</Text>}
          {organization.invoiceRecipientEmail && (
            <Text>{organization.invoiceRecipientEmail}</Text>
          )}
        </View>
        <View style={{ fontSize: 8, marginBottom: 32 }}>
          <View
            style={[styles.tableRow, styles.bold, { borderColor: "#020817" }]}
          >
            <Text style={[styles.tableCell, { flexBasis: 20 }]}>#</Text>
            <Text style={[styles.tableCell, { flexBasis: 60 }]}>User</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Job</Text>
            <Text style={[styles.tableCell, { flexBasis: 100 }]}>Task</Text>
            <Text style={[styles.tableCell, { flexBasis: 50 }]}>Cost</Text>
            <Text style={[styles.tableCell, { flexBasis: 60 }]}>
              Date{"         "} Completed {"  "} /Canceled
            </Text>
          </View>
          {lineItems.map((value, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flexBasis: 20 }]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 60 }]}>
                {value.assigneeName}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {value.jobDescription}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 100 }]}>
                {value.taskName}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 50 }]}>
                ${value.taskExpenseTotal}
              </Text>
              <Text style={[styles.tableCell, { flexBasis: 60 }]}>
                {value.doneAt == null
                  ? "-"
                  : format(new Date(value.doneAt), "MM-dd-yyyy")}
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
              <Text>{vendorInvoice.note ?? "-"}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Subtotal</Text>
              <Text>${vendorInvoice.subTotal}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Total</Text>
              <Text>${vendorInvoice.total}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Total Difference</Text>
              <Text>${vendorInvoice.invoiceTotalDifference}</Text>
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
