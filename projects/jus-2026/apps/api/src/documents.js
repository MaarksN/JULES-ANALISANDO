import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer } from "docx";

export const generateDocx = async (htmlContent, metadata) => {
    // Advanced parsing would convert HTML to DOCX nodes.
    // For this implementation, we will treat the content as Markdown-like text
    // and split by paragraphs to apply ABNT styling manually for maximum control.
    // Real-world would use 'html-to-docx' buffer, but 'docx' gives us styling power.

    // Clean content tags for text processing
    const cleanText = htmlContent.replace(/<[^>]*>?/gm, '\n');
    const lines = cleanText.split('\n').filter(line => line.trim().length > 0);

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "Normal",
                    name: "Normal",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: "Times New Roman",
                        size: 24, // 12pt
                    },
                    paragraph: {
                        spacing: { line: 360 }, // 1.5 spacing
                        alignment: AlignmentType.JUSTIFIED,
                        indent: { firstLine: 708 }, // 1.25cm
                    },
                },
                {
                    id: "Heading1",
                    name: "Heading 1",
                    run: {
                        font: "Times New Roman",
                        size: 28, // 14pt
                        bold: true,
                        allCaps: true,
                    },
                    paragraph: {
                        spacing: { before: 240, after: 120 },
                        alignment: AlignmentType.CENTER,
                    },
                }
            ],
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1701, // 3cm
                            bottom: 1134, // 2cm
                            left: 1701, // 3cm
                            right: 1134, // 2cm
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: metadata.firmName || "ADVOCACIA",
                                        bold: true,
                                        size: 20,
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${metadata.lawyerName} - OAB ${metadata.oab}`,
                                        size: 18,
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                },
                children: lines.map(line => {
                    const isHeading = line.startsWith('#') || line.toUpperCase() === line && line.length < 50;

                    if (isHeading) {
                        return new Paragraph({
                            text: line.replace(/[#*]/g, ''),
                            style: "Heading1",
                        });
                    }

                    return new Paragraph({
                        text: line,
                        style: "Normal",
                    });
                }),
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
};
