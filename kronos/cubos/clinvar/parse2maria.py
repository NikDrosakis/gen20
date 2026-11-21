#!/usr/bin/env python3
# clinvar_vcv_to_csv.py - Convert ClinVar VCV XML to CSV with streaming

import gzip
import xml.etree.ElementTree as ET
import sys
import csv
import re

def parse_vcv_record(elem, file_name=''):
    """Extract all important data from a VariationArchive record"""

    record = {
        # Basic VariationArchive attributes
        'accession': elem.get('Accession', ''),
        'variation_id': elem.get('VariationID', ''),
        'variation_name': elem.get('VariationName', ''),
        'variation_type': elem.get('VariationType', ''),
        'version': elem.get('Version', ''),
        'record_type': elem.get('RecordType', ''),
        'date_created': elem.get('DateCreated', ''),
        'date_last_updated': elem.get('DateLastUpdated', ''),
        'num_submissions': elem.get('NumberOfSubmissions', ''),
        'num_submitters': elem.get('NumberOfSubmitters', ''),
        'most_recent_submission': elem.get('MostRecentSubmission', ''),

        # RecordStatus
        'record_status': '',

        # Gene info
        'gene_symbol': '',
        'gene_full_name': '',
        'gene_id': '',
        'hgnc_id': '',
        'omim_gene': '',

        # SPDI
        'canonical_spdi': '',

        # GRCh37 location
        'chrom_grch37': '',
        'pos_grch37': '',
        'ref_grch37': '',
        'alt_grch37': '',
        'start_grch37': '',
        'stop_grch37': '',
        'strand_grch37': '',

        # GRCh38 location
        'chrom_grch38': '',
        'pos_grch38': '',
        'ref_grch38': '',
        'alt_grch38': '',
        'start_grch38': '',
        'stop_grch38': '',
        'strand_grch38': '',

        # HGVS
        'hgvs_c': '',
        'hgvs_p': '',
        'hgvs_lrg': '',
        'hgvs_genomic_grch37': '',
        'hgvs_genomic_grch38': '',

        # Clinical significance
        'clinical_significance': '',
        'review_status': '',
        'date_last_evaluated': '',
        'submission_count': '',
        'submitter_name': '',

        # RCV
        'rcv_accession': '',
        'rcv_version': '',
        'rcv_title': '',
        'condition_name': '',
        'condition_medgen': '',
        'condition_snomed': '',

        # Cross-references
        'dbsnp_id': '',
        'clinvar_allele_id': '',
        'omim_allelic_variant': '',
        'clingen_id': '',

        # Citation
        'citation_pmid': '',

        # File metadata
        'file_name': file_name
    }

    # Record status
    status = elem.find('./RecordStatus')
    if status is not None and status.text:
        record['record_status'] = status.text

    # Find ClassifiedRecord
    classified = elem.find('./ClassifiedRecord')
    if classified is None:
        return record

    # SimpleAllele
    simple_allele = classified.find('.//SimpleAllele')
    if simple_allele is not None:
        record['clinvar_allele_id'] = simple_allele.get('AlleleID', '')
        if not record['variation_id']:
            record['variation_id'] = simple_allele.get('VariationID', '')

        # Gene info
        gene = simple_allele.find('.//Gene')
        if gene is not None:
            record['gene_symbol'] = gene.get('Symbol', '')
            record['gene_full_name'] = gene.get('FullName', '')
            record['gene_id'] = gene.get('GeneID', '')
            record['hgnc_id'] = gene.get('HGNC_ID', '')

            # OMIM gene
            omim = gene.find('./OMIM')
            if omim is not None and omim.text:
                record['omim_gene'] = omim.text

        # SPDI
        spdi = simple_allele.find('./CanonicalSPDI')
        if spdi is not None and spdi.text:
            record['canonical_spdi'] = spdi.text

        # Locations
        locations = simple_allele.findall('.//SequenceLocation')
        for loc in locations:
            assembly = loc.get('Assembly', '')
            if assembly == 'GRCh37':
                record['chrom_grch37'] = loc.get('Chr', '')
                record['start_grch37'] = loc.get('start', '')
                record['stop_grch37'] = loc.get('stop', '')
                record['pos_grch37'] = loc.get('positionVCF', loc.get('start', ''))
                record['ref_grch37'] = loc.get('referenceAlleleVCF', loc.get('referenceAllele', ''))
                record['alt_grch37'] = loc.get('alternateAlleleVCF', loc.get('alternateAllele', ''))
                record['strand_grch37'] = loc.get('Strand', '')
            elif assembly == 'GRCh38':
                record['chrom_grch38'] = loc.get('Chr', '')
                record['start_grch38'] = loc.get('start', '')
                record['stop_grch38'] = loc.get('stop', '')
                record['pos_grch38'] = loc.get('positionVCF', loc.get('start', ''))
                record['ref_grch38'] = loc.get('referenceAlleleVCF', loc.get('referenceAllele', ''))
                record['alt_grch38'] = loc.get('alternateAlleleVCF', loc.get('alternateAllele', ''))
                record['strand_grch38'] = loc.get('Strand', '')

        # HGVS
        hgvs_list = simple_allele.find('./HGVSlist')
        if hgvs_list is not None:
            for hgvs in hgvs_list.findall('.//HGVS'):
                hgvs_type = hgvs.get('Type', '')
                assembly = hgvs.get('Assembly', '')

                # Coding HGVS
                if hgvs_type == 'coding':
                    # Nucleotide
                    nucl_expr = hgvs.find('.//NucleotideExpression/Expression')
                    if nucl_expr is not None and nucl_expr.text:
                        if 'NM_' in nucl_expr.text or 'LRG_' in nucl_expr.text:
                            record['hgvs_c'] = nucl_expr.text

                    # Protein
                    prot_expr = hgvs.find('.//ProteinExpression/Expression')
                    if prot_expr is not None and prot_expr.text:
                        if 'NP_' in prot_expr.text or 'LRG_' in prot_expr.text:
                            record['hgvs_p'] = prot_expr.text

                # Genomic HGVS
                elif hgvs_type == 'genomic' or 'genomic' in hgvs_type:
                    nucl_expr = hgvs.find('.//NucleotideExpression/Expression')
                    if nucl_expr is not None and nucl_expr.text:
                        if assembly == 'GRCh37':
                            record['hgvs_genomic_grch37'] = nucl_expr.text
                        elif assembly == 'GRCh38':
                            record['hgvs_genomic_grch38'] = nucl_expr.text
                        elif 'LRG_' in nucl_expr.text:
                            record['hgvs_lrg'] = nucl_expr.text

        # XRefs (dbSNP, OMIM, ClinGen)
        xrefs = simple_allele.find('./XRefList')
        if xrefs is not None:
            for xref in xrefs.findall('.//XRef'):
                db = xref.get('DB', '')
                xid = xref.get('ID', '')
                if db == 'dbSNP' and xid.startswith('rs'):
                    record['dbsnp_id'] = xid
                elif db == 'OMIM' and xid.endswith('.'):
                    record['omim_allelic_variant'] = xid
                elif db == 'ClinGen':
                    record['clingen_id'] = xid

    # RCVList
    rcv_list = classified.find('./RCVList')
    if rcv_list is not None:
        for rcv in rcv_list.findall('.//RCVAccession'):
            record['rcv_accession'] = rcv.get('Accession', '')
            record['rcv_version'] = rcv.get('Version', '')
            record['rcv_title'] = rcv.get('Title', '')

            # Condition
            condition = rcv.find('.//ClassifiedCondition')
            if condition is not None:
                record['condition_name'] = condition.text if condition.text else ''
                record['condition_medgen'] = condition.get('ID', '')

            # Break after first RCV
            break

    # Classifications
    classifications = classified.find('.//Classifications')
    if classifications is not None:
        # GermlineClassification
        germline = classifications.find('.//GermlineClassification')
        if germline is not None:
            record['date_last_evaluated'] = germline.get('DateLastEvaluated', '')
            record['submission_count'] = germline.get('NumberOfSubmissions', '')

            # Review Status
            review = germline.find('./ReviewStatus')
            if review is not None and review.text:
                record['review_status'] = review.text

            # Description (Clinical Significance)
            desc = germline.find('./Description')
            if desc is not None and desc.text:
                record['clinical_significance'] = desc.text

            # Submitter
            submitter = germline.find('.//SubmitterName')
            if submitter is not None and submitter.text:
                record['submitter_name'] = submitter.text

            # Citation (PMID)
            citation = germline.find('.//Citation/ID')
            if citation is not None and citation.text:
                record['citation_pmid'] = citation.text

            # Condition from classification
            condition = germline.find('.//ConditionList/TraitSet/Trait/Name/ElementValue')
            if condition is not None and condition.text and not record['condition_name']:
                record['condition_name'] = condition.text

    return record

def get_file_handle(file_path):
    """Open file - supports both .gz and .xml"""
    if file_path.endswith('.gz'):
        return gzip.open(file_path, 'rb')
    else:
        return open(file_path, 'rb')

def stream_vcv_to_csv(xml_file, output_file, batch_size=10000):
    """Stream VCV XML to CSV with batch processing"""

    print(f"🚀 Starting conversion: {xml_file}")
    print(f"📝 Output: {output_file}")
    print(f"📦 Batch size: {batch_size}")

    # CSV header
    header = [
        'accession', 'variation_id', 'variation_name', 'variation_type',
        'version', 'record_type', 'record_status',
        'date_created', 'date_last_updated',
        'num_submissions', 'num_submitters', 'most_recent_submission',
        'gene_symbol', 'gene_full_name', 'gene_id', 'hgnc_id', 'omim_gene',
        'chrom_grch37', 'pos_grch37', 'ref_grch37', 'alt_grch37',
        'start_grch37', 'stop_grch37', 'strand_grch37',
        'chrom_grch38', 'pos_grch38', 'ref_grch38', 'alt_grch38',
        'start_grch38', 'stop_grch38', 'strand_grch38',
        'canonical_spdi', 'hgvs_c', 'hgvs_p',
        'hgvs_lrg', 'hgvs_genomic_grch37', 'hgvs_genomic_grch38',
        'clinical_significance', 'review_status',
        'date_last_evaluated', 'submission_count', 'submitter_name',
        'rcv_accession', 'rcv_version', 'rcv_title',
        'condition_name', 'condition_medgen', 'condition_snomed',
        'dbsnp_id', 'clinvar_allele_id', 'omim_allelic_variant', 'clingen_id',
        'citation_pmid', 'file_name'
    ]

    # Open output file
    out = open(output_file, 'w', newline='', encoding='utf-8')
    writer = csv.writer(out)
    writer.writerow(header)

    record_count = 0
    batch_count = 0
    file_name = xml_file.split('/')[-1]

    try:
        # Open file (supports both .gz and .xml)
        with get_file_handle(xml_file) as f:
            # Iterate through XML
            for event, elem in ET.iterparse(f, events=('end',)):
                if elem.tag == 'VariationArchive':
                    try:
                        # Parse record
                        record = parse_vcv_record(elem, file_name)

                        # Write row
                        row = [record.get(col, '') for col in header]
                        writer.writerow(row)

                        record_count += 1
                        batch_count += 1

                        # Flush and clear memory periodically
                        if batch_count >= batch_size:
                            out.flush()
                            batch_count = 0
                            sys.stderr.write(f"\r✅ Processed {record_count} records...")
                            sys.stderr.flush()

                            # Force garbage collection
                            import gc
                            gc.collect()

                    except Exception as e:
                        sys.stderr.write(f"\n❌ Error at record {record_count}: {e}\n")

                    # Free memory
                    elem.clear()

    except KeyboardInterrupt:
        print(f"\n⚠️ Interrupted at {record_count} records")
    finally:
        out.close()

    print(f"\n✅ Done! Processed {record_count} records.")
    return record_count

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Convert ClinVar VCV XML to CSV with streaming')
    parser.add_argument('-x', '--xml', required=True, help='ClinVar VCV XML file (.xml or .gz)')
    parser.add_argument('-o', '--output', default='clinvar_vcv.csv', help='Output CSV file')
    parser.add_argument('-b', '--batch', type=int, default=10000, help='Batch size for flushing (default: 10000)')
    args = parser.parse_args()

    stream_vcv_to_csv(args.xml, args.output, args.batch)

if __name__ == "__main__":
    main()